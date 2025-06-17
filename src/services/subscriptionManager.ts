
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// TypeScript interfaces for the subscription manager
export interface SubscriptionConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: Record<string, any>;
}

export interface SubscriptionCallback<T = any> {
  (payload: RealtimePostgresChangesPayload<T>): void;
}

interface ChannelManager {
  channel: RealtimeChannel;
  callbacks: Set<SubscriptionCallback>;
  config: SubscriptionConfig;
  status: string;
}

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, ChannelManager> = new Map();
  private isCleaningUp: boolean = false;

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
   * Generate a unique channel key based on table and filter configuration
   */
  private generateChannelKey(config: SubscriptionConfig): string {
    const { table, event = '*', schema = 'public', filter } = config;
    const filterKey = filter ? JSON.stringify(filter) : '';
    return `${schema}.${table}.${event}.${filterKey}`;
  }

  /**
   * Generate a unique channel name to prevent conflicts
   */
  private generateChannelName(config: SubscriptionConfig): string {
    const key = this.generateChannelKey(config);
    const timestamp = Date.now();
    return `subscription-${key.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;
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

    const channelKey = this.generateChannelKey(config);
    let channelManager = this.channels.get(channelKey);

    // If channel doesn't exist, create it
    if (!channelManager) {
      const channelName = this.generateChannelName(config);
      const channel = supabase.channel(channelName);

      channelManager = {
        channel,
        callbacks: new Set<SubscriptionCallback>(),
        config,
        status: 'idle'
      };

      // Configure the channel
      const { table, event = '*', schema = 'public', filter } = config;
      
      let postgresChangesConfig: any = {
        event,
        schema,
        table
      };

      // Add filter if provided
      if (filter) {
        postgresChangesConfig = { ...postgresChangesConfig, filter };
      }

      channel.on('postgres_changes', postgresChangesConfig, (payload) => {
        // Call all registered callbacks for this channel
        channelManager!.callbacks.forEach(cb => {
          try {
            cb(payload);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        });
      });

      // Handle subscription status changes
      channel.subscribe((status) => {
        console.log(`Subscription status for ${channelKey}:`, status);
        
        if (channelManager) {
          channelManager.status = status;
        }

        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${channelKey}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Channel error for ${channelKey}, cleaning up...`);
          this.cleanupChannel(channelKey);
        }
      });

      this.channels.set(channelKey, channelManager);
    }

    // Add callback to the channel
    channelManager.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      const manager = this.channels.get(channelKey);
      if (manager) {
        manager.callbacks.delete(callback);
        
        // If no more callbacks, cleanup the channel
        if (manager.callbacks.size === 0) {
          this.cleanupChannel(channelKey);
        }
      }
    };
  }

  /**
   * Clean up a specific channel
   */
  private cleanupChannel(channelKey: string): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      try {
        console.log(`Cleaning up channel: ${channelKey}`);
        supabase.removeChannel(channelManager.channel);
        this.channels.delete(channelKey);
      } catch (error) {
        console.warn(`Error cleaning up channel ${channelKey}:`, error);
        // Force remove from map even if cleanup fails
        this.channels.delete(channelKey);
      }
    }
  }

  /**
   * Get the status of a specific channel
   */
  public getChannelStatus(config: SubscriptionConfig): string | null {
    const channelKey = this.generateChannelKey(config);
    const channelManager = this.channels.get(channelKey);
    return channelManager ? channelManager.status : null;
  }

  /**
   * Reconnect a specific channel (useful for error recovery)
   */
  public async reconnectChannel(config: SubscriptionConfig): Promise<void> {
    const channelKey = this.generateChannelKey(config);
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
   * Clean up all subscriptions (useful for logout)
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    console.log(`Cleaning up ${this.channels.size} subscription channels...`);
    
    // Create a copy of channel keys to avoid mutation during iteration
    const channelKeys = Array.from(this.channels.keys());
    
    channelKeys.forEach(channelKey => {
      this.cleanupChannel(channelKey);
    });
    
    // Clear the channels map
    this.channels.clear();
    
    this.isCleaningUp = false;
    console.log('All subscription channels cleaned up');
  }

  /**
   * Get active channel count (useful for debugging)
   */
  public getActiveChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Get channel information (useful for debugging)
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

// Export the singleton instance
export const subscriptionManager = SubscriptionManager.getInstance();

// Export the class for type checking
export type { ChannelManager };
