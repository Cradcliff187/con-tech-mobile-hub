
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
 */
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, ChannelManager> = new Map();
  private isCleaningUp: boolean = false;
  private errorHandler: SubscriptionErrorHandler = new SubscriptionErrorHandler();

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
   * Subscribe to a table with automatic deduplication
   */
  public subscribe<T = any>(
    config: SubscriptionConfig,
    callback: SubscriptionCallback<T>
  ): () => void {
    if (this.isCleaningUp) {
      console.warn('Cannot subscribe during cleanup process');
      return () => {};
    }

    const channelKey = generateChannelKey(config);
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
          }, 1000); // 1 second debounce
        }
      }
    };
  }

  /**
   * Create a new channel with proper configuration
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
    
    let postgresChangesConfig: any = {
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
      // Call all registered callbacks for this channel
      channelManager.callbacks.forEach(cb => {
        try {
          cb(payload);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      });
    });

    // Enhanced subscription status handling with retry logic
    channel.subscribe((status) => {
      channelManager.status = status;

      if (status === 'CHANNEL_ERROR') {
        console.error(`Channel error for ${channelKey}, initiating retry...`);
        this.errorHandler.handleChannelError(
          channelKey,
          config,
          (key, cfg) => this.reconnectChannelInternal(key, cfg),
          (key) => this.cleanupChannel(key)
        );
      } else if (status === 'SUBSCRIBED') {
        // Reset reconnect attempts on successful connection
        this.errorHandler.resetReconnectAttempts(channelKey);
      }
    });

    return channelManager;
  }

  /**
   * Internal reconnection logic
   */
  private reconnectChannelInternal(channelKey: string, config: SubscriptionConfig): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      const callbacks = Array.from(channelManager.callbacks);
      
      // Clean up the existing channel
      this.cleanupChannel(channelKey);
      
      // Re-subscribe all callbacks
      callbacks.forEach(callback => {
        this.subscribe(config, callback);
      });
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
        console.warn(`Error cleaning up channel ${channelKey}:`, error);
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
   * Reconnect a specific channel
   */
  public async reconnectChannel(config: SubscriptionConfig): Promise<void> {
    const channelKey = generateChannelKey(config);
    this.reconnectChannelInternal(channelKey, config);
  }

  /**
   * Clean up all subscriptions
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    // Clear all error handling state
    this.errorHandler.cleanupAll();
    
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
}
