import { supabase } from '@/integrations/supabase/client';
import { SubscriptionConfig, SubscriptionCallback, ChannelManager } from './types';
import { generateChannelKey, generateChannelName, formatFilterForSupabase } from './channelUtils';
import { SubscriptionErrorHandler } from './errorHandling';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Enhanced Centralized Subscription Manager with improved error handling and deduplication
 */
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, ChannelManager> = new Map();
  private isCleaningUp: boolean = false;
  private errorHandler: SubscriptionErrorHandler = new SubscriptionErrorHandler();
  private globalRateLimit: Map<string, number> = new Map();
  private circuitBreaker: Map<string, { failures: number; lastFailure: number; isOpen: boolean }> = new Map();
  private subscriptionCallbacks: Map<string, Set<SubscriptionCallback>> = new Map();

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
    
    // Check rate limiting (max 5 operations per second per key)
    const lastCall = this.globalRateLimit.get(key) || 0;
    if (now - lastCall < 200) { // 200ms minimum between calls
      console.log(`Rate limiting subscription operation for ${key}`);
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
        console.log(`Circuit breaker open for ${key}`);
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
      // Return a no-op unsubscribe function for rate-limited calls
      return () => {};
    }

    // Store callback for this subscription
    if (!this.subscriptionCallbacks.has(channelKey)) {
      this.subscriptionCallbacks.set(channelKey, new Set());
    }
    this.subscriptionCallbacks.get(channelKey)!.add(callback);

    let channelManager = this.channels.get(channelKey);

    // If channel doesn't exist, create it
    if (!channelManager) {
      channelManager = this.createChannel(config, channelKey);
      this.channels.set(channelKey, channelManager);
    } else {
      // Channel exists, just add the callback
      channelManager.callbacks.add(callback);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptionCallbacks.get(channelKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptionCallbacks.delete(channelKey);
        }
      }

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
          }, 3000); // Increased debounce to 3 seconds
        }
      }
    };
  }

  /**
   * Create a new channel with proper configuration and error handling
   */
  private createChannel(config: SubscriptionConfig, channelKey: string): ChannelManager {
    const channelName = generateChannelName(config);
    
    // Check if we already have a channel with the same name
    const existingChannel = Array.from(this.channels.values()).find(
      manager => manager.channel.topic === channelName
    );
    
    if (existingChannel) {
      console.log(`Reusing existing channel: ${channelName}`);
      return existingChannel;
    }

    const channel = supabase.channel(channelName);

    const channelManager: ChannelManager = {
      channel,
      callbacks: new Set<SubscriptionCallback>(),
      config,
      status: 'idle'
    };

    // Configure the channel with proper filter format
    const { table, event = '*', schema = 'public', filter } = config;
    
    // Build the postgres changes configuration
    const postgresChangesConfig = {
      event,
      schema,
      table
    } as any;

    // Add filter if provided - convert to Supabase's expected string format
    if (filter && Object.keys(filter).length > 0) {
      const filterString = formatFilterForSupabase(filter);
      if (filterString) {
        postgresChangesConfig.filter = filterString;
      }
    }

    // Set up real-time listener with enhanced error handling
    channel.on(
      'postgres_changes',
      postgresChangesConfig,
      (payload: RealtimePostgresChangesPayload<any>) => {
        try {
          // Call all registered callbacks for this channel
          const callbacks = this.subscriptionCallbacks.get(channelKey);
          if (callbacks) {
            callbacks.forEach(cb => {
              try {
                cb(payload);
              } catch (error) {
                console.error(`Error in subscription callback for ${channelKey}:`, error);
              }
            });
          }
        } catch (error) {
          console.error(`Error processing subscription payload for ${channelKey}:`, error);
          this.recordFailure(channelKey);
        }
      }
    );

    // Enhanced subscription status handling with retry logic
    channel.subscribe((status) => {
      channelManager.status = status;
      console.log(`Channel ${channelName} status: ${status}`);

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
      const callbacks = Array.from(this.subscriptionCallbacks.get(channelKey) || []);
      
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
        console.log(`Cleaning up channel: ${channelKey}`);
        supabase.removeChannel(channelManager.channel);
      } catch (error) {
        console.error(`Error cleaning up channel ${channelKey}:`, error);
      }
      
      // Clean up error handling state
      this.errorHandler.cleanupErrorState(channelKey);
      this.channels.delete(channelKey);
      this.subscriptionCallbacks.delete(channelKey);
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
    this.subscriptionCallbacks.clear();
    
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
