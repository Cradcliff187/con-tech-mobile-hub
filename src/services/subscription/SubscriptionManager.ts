import { supabase } from '@/integrations/supabase/client';
import { SubscriptionConfig, SubscriptionCallback, ChannelManager } from './types';
import { generateChannelKey, generateChannelName, formatFilterForSupabase } from './channelUtils';
import { SubscriptionErrorHandler } from './errorHandling';

/**
 * Enhanced Centralized Subscription Manager with improved error handling and retry logic
 * 
 * This singleton class manages all real-time subscriptions in the application,
 * providing the following features:
 * 
 * - **Automatic Deduplication**: Multiple components subscribing to the same table
 *   will share a single channel, reducing overhead
 * - **Proper Cleanup**: Channels are automatically cleaned up when no longer needed
 * - **Error Recovery**: Built-in reconnection capabilities for failed channels
 * - **Debug Support**: Status monitoring and channel information for debugging
 * - **Rate Limiting**: Circuit breaker pattern to prevent server overload
 */
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, ChannelManager> = new Map();
  private isCleaningUp: boolean = false;
  private errorHandler: SubscriptionErrorHandler = new SubscriptionErrorHandler();
  private globalRateLimit: Map<string, number> = new Map();
  private circuitBreaker: Map<string, { failures: number; lastFailure: number; isOpen: boolean }> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  /**
   * Check if we should allow the operation based on rate limiting and circuit breaker
   */
  private shouldAllowOperation(key: string): boolean {
    const now = Date.now();
    
    // Check rate limiting (max 10 operations per second per key)
    const lastCall = this.globalRateLimit.get(key) || 0;
    if (now - lastCall < 100) { // 100ms minimum between calls
      return false;
    }
    
    // Check circuit breaker
    const breaker = this.circuitBreaker.get(key);
    if (breaker?.isOpen) {
      // Try to recover after 30 seconds
      if (now - breaker.lastFailure > 30000) {
        breaker.isOpen = false;
        breaker.failures = 0;
      } else {
        return false;
      }
    }
    
    this.globalRateLimit.set(key, now);
    return true;
  }

  /**
   * Record a failure for circuit breaker logic
   */
  private recordFailure(key: string): void {
    const breaker = this.circuitBreaker.get(key) || { failures: 0, lastFailure: 0, isOpen: false };
    breaker.failures++;
    breaker.lastFailure = Date.now();
    
    // Open circuit breaker after 3 failures
    if (breaker.failures >= 3) {
      breaker.isOpen = true;
    }
    
    this.circuitBreaker.set(key, breaker);
  }

  /**
   * Subscribe to a table with automatic deduplication and protection
   */
  public subscribe<T = any>(
    config: SubscriptionConfig,
    callback: SubscriptionCallback<T>
  ): () => void {
    if (this.isCleaningUp) {
      return () => {};
    }

    const channelKey = generateChannelKey(config);
    
    // Check rate limiting and circuit breaker
    if (!this.shouldAllowOperation(channelKey)) {
      return () => {};
    }

    let channelManager = this.channels.get(channelKey);

    // If channel doesn't exist, create it
    if (!channelManager) {
      channelManager = this.createChannel(config, channelKey);
      this.channels.set(channelKey, channelManager);
    }

    // Add callback to the channel
    channelManager.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      const manager = this.channels.get(channelKey);
      if (manager) {
        manager.callbacks.delete(callback);
        
        // If no more callbacks, cleanup the channel with debouncing
        if (manager.callbacks.size === 0) {
          // Debounce cleanup to prevent rapid create/destroy cycles
          setTimeout(() => {
            const currentManager = this.channels.get(channelKey);
            if (currentManager && currentManager.callbacks.size === 0) {
              this.cleanupChannel(channelKey);
            }
          }, 2000); // Increased debounce to 2 seconds
        }
      }
    };
  }

  /**
   * Create a new channel with proper configuration and error handling
   */
  private createChannel(config: SubscriptionConfig, channelKey: string): ChannelManager {
    const channelName = generateChannelName(config);
    const channel = supabase.channel(channelName);

    const channelManager: ChannelManager = {
      channel,
      callbacks: new Set<SubscriptionCallback>(),
      config,
      status: 'idle'
    };

    // Configure the channel with proper filter format
    const { table, event = '*', schema = 'public', filter } = config;
    
    interface PostgresChangesConfig {
      event: string;
      schema: string;
      table: string;
      filter?: string;
    }

    let postgresChangesConfig: PostgresChangesConfig = {
      event,
      schema,
      table
    };

    // Add filter if provided - convert to Supabase's expected string format
    if (filter && Object.keys(filter).length > 0) {
      const filterString = formatFilterForSupabase(filter);
      if (filterString) {
        postgresChangesConfig.filter = filterString;
      }
    }

    // Set up real-time listener with enhanced error handling
    channel.on('postgres_changes', postgresChangesConfig, (payload) => {
      try {
        // Call all registered callbacks for this channel
        channelManager.callbacks.forEach(cb => {
          try {
            cb(payload);
          } catch (error) {
            // Error in callback - log but don't fail entire channel
          }
        });
      } catch (error) {
        this.recordFailure(channelKey);
      }
    });

    // Enhanced subscription status handling with retry logic
    channel.subscribe((status) => {
      channelManager.status = status;

      if (status === 'CHANNEL_ERROR') {
        this.recordFailure(channelKey);
        
        // Only retry if circuit breaker allows it
        if (this.shouldAllowOperation(`retry-${channelKey}`)) {
          this.errorHandler.handleChannelError(
            channelKey,
            config,
            (key, cfg) => this.reconnectChannelInternal(key, cfg),
            (key) => this.cleanupChannel(key)
          );
        }
      } else if (status === 'SUBSCRIBED') {
        // Reset circuit breaker on successful connection
        this.circuitBreaker.delete(channelKey);
        this.errorHandler.resetReconnectAttempts(channelKey);
      }
    });

    return channelManager;
  }

  /**
   * Internal reconnection logic with exponential backoff
   */
  private reconnectChannelInternal(channelKey: string, config: SubscriptionConfig): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      const callbacks = Array.from(channelManager.callbacks);
      
      // Clean up the existing channel
      this.cleanupChannel(channelKey);
      
      // Re-subscribe all callbacks with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, (this.circuitBreaker.get(channelKey)?.failures || 0)), 30000);
      
      setTimeout(() => {
        callbacks.forEach(callback => {
          this.subscribe(config, callback);
        });
      }, retryDelay);
    }
  }

  /**
   * Clean up a specific channel and remove it from the manager
   */
  private cleanupChannel(channelKey: string): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      try {
        supabase.removeChannel(channelManager.channel);
      } catch (error) {
        // Cleanup error - not critical
      }
      
      // Clean up error handling state
      this.errorHandler.cleanupErrorState(channelKey);
      this.channels.delete(channelKey);
    }
  }

  /**
   * Get the status of a specific channel
   */
  public getChannelStatus(config: SubscriptionConfig): string | null {
    const channelKey = generateChannelKey(config);
    const channelManager = this.channels.get(channelKey);
    return channelManager ? channelManager.status : null;
  }

  /**
   * Reconnect a specific channel with rate limiting
   */
  public async reconnectChannel(config: SubscriptionConfig): Promise<void> {
    const channelKey = generateChannelKey(config);
    
    if (!this.shouldAllowOperation(`reconnect-${channelKey}`)) {
      return;
    }
    
    this.reconnectChannelInternal(channelKey, config);
  }

  /**
   * Clean up all subscriptions
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    // Clear all error handling state
    this.errorHandler.cleanupAll();
    
    // Clear rate limiting and circuit breaker state
    this.globalRateLimit.clear();
    this.circuitBreaker.clear();
    
    const channelKeys = Array.from(this.channels.keys());
    channelKeys.forEach(channelKey => {
      this.cleanupChannel(channelKey);
    });
    
    this.channels.clear();
    this.isCleaningUp = false;
  }

  /**
   * Get active channel count (useful for debugging)
   */
  public getActiveChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Get detailed channel information (useful for debugging)
   */
  public getChannelInfo(): Array<{ key: string; callbackCount: number; status: string; config: SubscriptionConfig }> {
    return Array.from(this.channels.entries()).map(([key, manager]) => ({
      key,
      callbackCount: manager.callbacks.size,
      status: manager.status,
      config: manager.config
    }));
  }

  /**
   * Get circuit breaker status for debugging
   */
  public getCircuitBreakerStatus(): Array<{ key: string; failures: number; isOpen: boolean; lastFailure: number }> {
    return Array.from(this.circuitBreaker.entries()).map(([key, breaker]) => ({
      key,
      failures: breaker.failures,
      isOpen: breaker.isOpen,
      lastFailure: breaker.lastFailure
    }));
  }
}
