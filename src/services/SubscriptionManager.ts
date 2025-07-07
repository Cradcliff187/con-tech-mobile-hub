import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscription states for tracking channel lifecycle
 */
type SubscriptionState = 'IDLE' | 'CONNECTING' | 'SUBSCRIBED' | 'ERROR' | 'CLEANUP';

/**
 * Configuration for a subscription channel
 */
interface ChannelConfig {
  channel: RealtimeChannel;
  tableName: string;
  callbacks: Set<(payload: any) => void>;
  state: SubscriptionState;
  retryCount: number;
  lastError?: string;
  createdAt: number;
  subscribedAt?: number;
  userId?: string;
  isSubscribing: boolean; // New flag to prevent double subscription
}

/**
 * Options for subscribing to a table
 */
interface SubscriptionOptions {
  userId?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  onStateChange?: (state: SubscriptionState, error?: string) => void;
  maxRetries?: number;
}

/**
 * Subscription statistics for monitoring
 */
interface SubscriptionStats {
  totalChannels: number;
  activeSubscriptions: number;
  erroredSubscriptions: number;
  totalCallbacks: number;
  uptimeMs: number;
}

/**
 * Centralized subscription manager for Supabase real-time subscriptions.
 * 
 * This singleton service prevents duplicate subscriptions, manages channel lifecycle,
 * and provides robust error handling with exponential backoff retry logic.
 * 
 * Key Features:
 * - One channel per table globally to prevent conflicts
 * - Automatic retry with exponential backoff
 * - React StrictMode compatibility
 * - Debounced operations to prevent rapid subscribe/unsubscribe
 * - Comprehensive error handling and logging
 * - Subscription health monitoring
 * 
 * @example
 * ```typescript
 * const manager = SubscriptionManager.getInstance();
 * 
 * // Subscribe to projects table
 * const unsubscribe = manager.subscribe('projects', (payload) => {
 *   console.log('Projects updated:', payload);
 * }, { userId: 'user-123' });
 * 
 * // Cleanup when component unmounts
 * useEffect(() => unsubscribe, []);
 * ```
 */
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels = new Map<string, ChannelConfig>();
  private channelRegistry = new Map<string, boolean>(); // Global channel registry
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private lastSubscriptionCall = new Map<string, number>();
  private readonly startTime = Date.now();
  
  // Configuration constants
  private readonly DEBOUNCE_DELAY = 100; // ms
  private readonly MAX_RETRIES = 5;
  private readonly BASE_RETRY_DELAY = 100; // ms
  private readonly MAX_RETRY_DELAY = 5000; // ms
  private readonly CLEANUP_TIMEOUT = 30000; // ms
  private readonly STRICTMODE_DETECTION_WINDOW = 50; // ms

  private constructor() {
    this.setupGlobalErrorHandling();
    this.startPeriodicCleanup();
  }

  /**
   * Get the singleton instance of SubscriptionManager
   */
  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  /**
   * Subscribe to real-time updates for a table
   * 
   * @param tableName - The database table to subscribe to
   * @param callback - Function to call when updates occur
   * @param options - Additional subscription options
   * @returns Unsubscribe function
   */
  public subscribe(
    tableName: string,
    callback: (payload: any) => void,
    options: SubscriptionOptions = {}
  ): () => void {
    const { userId, event = '*', onStateChange, maxRetries = this.MAX_RETRIES } = options;
    
    this.log('INFO', `Subscribe request for table: ${tableName}`, { userId, event });

    // Improved StrictMode detection - only debounce if rapid successive calls
    const now = Date.now();
    const lastCall = this.lastSubscriptionCall.get(tableName) || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < 100) { // 100ms threshold for rapid calls
      this.log('WARN', `StrictMode double-mount detected for ${tableName}, debouncing...`);
      return () => {}; // Return no-op cleanup for debounced calls
    }
    
    this.lastSubscriptionCall.set(tableName, now);

    // Debounce subscription requests
    this.debounceOperation(tableName, async () => {
      await this.performSubscription(tableName, callback, event, userId, onStateChange, maxRetries);
    });

    // Return unsubscribe function
    return () => this.unsubscribe(tableName, callback);
  }

  /**
   * Unsubscribe a callback from a table
   * 
   * @param tableName - The database table
   * @param callback - The callback to remove
   */
  public unsubscribe(tableName: string, callback: (payload: any) => void): void {
    const config = this.channels.get(tableName);
    if (!config) {
      this.log('DEBUG', `No subscription found for table: ${tableName}`);
      return;
    }

    config.callbacks.delete(callback);
    this.log('DEBUG', `Callback removed for ${tableName}, remaining: ${config.callbacks.size}`);

    // If no callbacks remain, cleanup the channel
    if (config.callbacks.size === 0) {
      this.debounceOperation(`cleanup_${tableName}`, () => {
        this.cleanupChannel(tableName);
      });
    }
  }

  /**
   * Get subscription statistics for monitoring
   */
  public getStats(): SubscriptionStats {
    const activeSubscriptions = Array.from(this.channels.values())
      .filter(config => config.state === 'SUBSCRIBED').length;
    
    const erroredSubscriptions = Array.from(this.channels.values())
      .filter(config => config.state === 'ERROR').length;

    const totalCallbacks = Array.from(this.channels.values())
      .reduce((sum, config) => sum + config.callbacks.size, 0);

    return {
      totalChannels: this.channels.size,
      activeSubscriptions,
      erroredSubscriptions,
      totalCallbacks,
      uptimeMs: Date.now() - this.startTime
    };
  }

  /**
   * Get detailed subscription information for debugging
   */
  public getSubscriptionInfo(tableName?: string): Record<string, any> {
    if (tableName) {
      const config = this.channels.get(tableName);
      return config ? this.formatChannelInfo(tableName, config) : {};
    }

    const info: Record<string, any> = {};
    for (const [name, config] of this.channels) {
      info[name] = this.formatChannelInfo(name, config);
    }
    return info;
  }

  /**
   * Force cleanup of all subscriptions (useful for testing)
   */
  public async cleanup(): Promise<void> {
    this.log('INFO', 'Starting forced cleanup of all subscriptions');
    
    const cleanupPromises = Array.from(this.channels.keys()).map(tableName => 
      this.cleanupChannel(tableName)
    );

    await Promise.allSettled(cleanupPromises);
    
    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    this.log('INFO', 'Forced cleanup completed');
  }

  /**
   * Perform the actual subscription with retry logic
   */
  private async performSubscription(
    tableName: string,
    callback: (payload: any) => void,
    event: string,
    userId?: string,
    onStateChange?: (state: SubscriptionState, error?: string) => void,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<void> {
    // Check global channel registry to prevent conflicts
    if (this.channelRegistry.get(tableName)) {
      this.log('WARN', `Channel conflict detected for ${tableName}, using existing channel`);
    }

    let config = this.channels.get(tableName);

    if (config) {
      // Prevent concurrent subscription attempts
      if (config.isSubscribing) {
        this.log('WARN', `Subscription already in progress for ${tableName}, queueing callback`);
        setTimeout(() => {
          config?.callbacks.add(callback);
          if (config?.state === 'SUBSCRIBED') {
            onStateChange?.('SUBSCRIBED');
          }
        }, 50);
        return;
      }

      // Add callback to existing subscription
      config.callbacks.add(callback);
      this.log('DEBUG', `Added callback to existing subscription for ${tableName}`);
      
      if (config.state === 'SUBSCRIBED') {
        onStateChange?.('SUBSCRIBED');
      } else if (config.state === 'ERROR' && config.retryCount < maxRetries) {
        // Retry failed subscription
        await this.retrySubscription(tableName, onStateChange);
      }
      return;
    }

    // Mark channel in registry
    this.channelRegistry.set(tableName, true);

    // Create new subscription
    const channelName = this.generateChannelName(tableName, userId);
    const channel = supabase.channel(channelName);

    config = {
      channel,
      tableName,
      callbacks: new Set([callback]),
      state: 'CONNECTING',
      retryCount: 0,
      createdAt: Date.now(),
      userId,
      isSubscribing: true // Set to true immediately to prevent race conditions
    };

    this.channels.set(tableName, config);
    onStateChange?.('CONNECTING');

    this.log('DEBUG', `Creating new subscription for ${tableName} with channel: ${channelName}`);

    try {
      // Set up postgres changes listener with proper await
      const subscription = channel
        .on('postgres_changes', {
          event: event as any,
          schema: 'public',
          table: tableName
        }, (payload) => {
          this.log('DEBUG', `Received update for ${tableName}:`, payload);
          // Notify all callbacks
          const currentConfig = this.channels.get(tableName);
          if (currentConfig) {
            for (const cb of currentConfig.callbacks) {
              try {
                cb(payload);
              } catch (error) {
                this.log('ERROR', `Callback error for ${tableName}:`, error);
              }
            }
          }
        });

      // Subscribe with proper error handling
      subscription.subscribe((status) => {
        const currentConfig = this.channels.get(tableName);
        if (currentConfig) {
          currentConfig.isSubscribing = false;
          this.handleSubscriptionStatus(tableName, status, onStateChange, maxRetries);
        }
      });

    } catch (error) {
      config.isSubscribing = false;
      config.state = 'ERROR';
      config.lastError = error instanceof Error ? error.message : 'Unknown subscription error';
      this.log('ERROR', `Subscription setup failed for ${tableName}:`, error);
      onStateChange?.('ERROR', config.lastError);
    }
  }

  /**
   * Handle subscription status changes
   */
  private handleSubscriptionStatus(
    tableName: string,
    status: string,
    onStateChange?: (state: SubscriptionState, error?: string) => void,
    maxRetries: number = this.MAX_RETRIES
  ): void {
    const config = this.channels.get(tableName);
    if (!config) return;

    this.log('DEBUG', `Subscription status for ${tableName}: ${status}`);

    switch (status) {
      case 'SUBSCRIBED':
        config.state = 'SUBSCRIBED';
        config.subscribedAt = Date.now();
        config.retryCount = 0; // Reset retry count on success
        onStateChange?.('SUBSCRIBED');
        this.log('INFO', `Successfully subscribed to ${tableName}`);
        break;

      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
        config.state = 'ERROR';
        config.lastError = status;
        onStateChange?.('ERROR', status);
        this.log('ERROR', `Subscription error for ${tableName}: ${status}`);
        
        if (config.retryCount < maxRetries) {
          this.retrySubscription(tableName, onStateChange);
        } else {
          this.log('ERROR', `Max retries exceeded for ${tableName}, giving up`);
        }
        break;

      case 'CLOSED':
        if (config.state !== 'CLEANUP') {
          this.log('WARN', `Unexpected channel closure for ${tableName}`);
          // Attempt to reconnect
          this.retrySubscription(tableName, onStateChange);
        }
        break;

      default:
        this.log('DEBUG', `Unknown subscription status for ${tableName}: ${status}`);
    }
  }

  /**
   * Retry subscription with exponential backoff
   */
  private async retrySubscription(
    tableName: string,
    onStateChange?: (state: SubscriptionState, error?: string) => void
  ): Promise<void> {
    const config = this.channels.get(tableName);
    if (!config) return;

    config.retryCount++;
    const delay = Math.min(
      this.BASE_RETRY_DELAY * Math.pow(2, config.retryCount - 1),
      this.MAX_RETRY_DELAY
    );

    this.log('INFO', `Retrying subscription for ${tableName} (attempt ${config.retryCount}) in ${delay}ms`);

    setTimeout(async () => {
      if (this.channels.has(tableName)) { // Check if still needed
        await this.cleanupChannel(tableName, false);
        
        // Recreate subscription with existing callbacks
        const callbacks = Array.from(config.callbacks);
        this.channels.delete(tableName);
        
        if (callbacks.length > 0) {
          await this.performSubscription(
            tableName,
            callbacks[0],
            '*',
            config.userId,
            onStateChange
          );
          
          // Re-add other callbacks
          for (let i = 1; i < callbacks.length; i++) {
            const newConfig = this.channels.get(tableName);
            newConfig?.callbacks.add(callbacks[i]);
          }
        }
      }
    }, delay);
  }

  /**
   * Cleanup a subscription channel
   */
  private async cleanupChannel(tableName: string, removeFromMap = true): Promise<void> {
    const config = this.channels.get(tableName);
    if (!config) return;

    config.state = 'CLEANUP';
    this.log('DEBUG', `Cleaning up subscription for ${tableName}`);

    try {
      await supabase.removeChannel(config.channel);
      this.log('DEBUG', `Successfully removed channel for ${tableName}`);
    } catch (error) {
      this.log('ERROR', `Error removing channel for ${tableName}:`, error);
    }

    if (removeFromMap) {
      this.channels.delete(tableName);
      this.channelRegistry.delete(tableName); // Clear from registry
    }
  }

  /**
   * Generate unique channel name
   */
  private generateChannelName(tableName: string, userId?: string): string {
    const timestamp = Date.now();
    const userSuffix = userId ? `_${userId.slice(-8)}` : '';
    return `${tableName}${userSuffix}_${timestamp}`;
  }

  /**
   * Debounce operations to prevent rapid subscribe/unsubscribe
   */
  private debounceOperation(key: string, operation: () => void | Promise<void>): void {
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      try {
        await operation();
      } catch (error) {
        this.log('ERROR', `Debounced operation failed for ${key}:`, error);
      }
      this.debounceTimers.delete(key);
    }, this.DEBOUNCE_DELAY);

    this.debounceTimers.set(key, timer);
  }


  /**
   * Set up global error handling
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections from subscription operations
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('subscription') || 
            event.reason?.message?.includes('channel')) {
          this.log('ERROR', 'Unhandled subscription error:', event.reason);
          event.preventDefault(); // Prevent console spam
        }
      });
    }
  }

  /**
   * Start periodic cleanup of stale subscriptions
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [tableName, config] of this.channels) {
        // Cleanup channels that have been in error state for too long
        if (config.state === 'ERROR' && 
            now - config.createdAt > this.CLEANUP_TIMEOUT) {
          this.log('WARN', `Cleaning up stale errored subscription for ${tableName}`);
          this.cleanupChannel(tableName);
        }
        
        // Cleanup channels with no callbacks
        if (config.callbacks.size === 0 && 
            now - config.createdAt > this.DEBOUNCE_DELAY * 2) {
          this.log('DEBUG', `Cleaning up empty subscription for ${tableName}`);
          this.cleanupChannel(tableName);
        }
      }
    }, this.CLEANUP_TIMEOUT);
  }

  /**
   * Format channel information for debugging
   */
  private formatChannelInfo(tableName: string, config: ChannelConfig): any {
    return {
      tableName: config.tableName,
      state: config.state,
      callbackCount: config.callbacks.size,
      retryCount: config.retryCount,
      lastError: config.lastError,
      uptimeMs: Date.now() - config.createdAt,
      subscribedMs: config.subscribedAt ? Date.now() - config.subscribedAt : null,
      userId: config.userId,
      isSubscribing: config.isSubscribing
    };
  }

  /**
   * Centralized logging with different levels
   */
  private log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[SubscriptionManager:${level}] ${timestamp}`;
    
    switch (level) {
      case 'DEBUG':
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, message, data || '');
        }
        break;
      case 'INFO':
        console.info(prefix, message, data || '');
        break;
      case 'WARN':
        console.warn(prefix, message, data || '');
        break;
      case 'ERROR':
        console.error(prefix, message, data || '');
        break;
    }
  }
}

// Export singleton instance for convenience
export const subscriptionManager = SubscriptionManager.getInstance();
