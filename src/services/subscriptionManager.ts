
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

/**
 * Centralized Subscription Manager for Supabase Real-time Updates
 * 
 * This singleton class manages all real-time subscriptions in the application,
 * providing the following features:
 * 
 * - **Automatic Deduplication**: Multiple components subscribing to the same table
 *   will share a single channel, reducing overhead
 * - **Proper Cleanup**: Channels are automatically cleaned up when no longer needed
 * - **Error Recovery**: Built-in reconnection capabilities for failed channels
 * - **Debug Support**: Status monitoring and channel information for debugging
 * 
 * @example Basic Usage
 * ```typescript
 * import { subscriptionManager } from '@/services/subscriptionManager';
 * 
 * // Subscribe to all task updates
 * const unsubscribe = subscriptionManager.subscribe(
 *   { table: 'tasks', event: '*' },
 *   (payload) => console.log('Task updated:', payload)
 * );
 * 
 * // Clean up when component unmounts
 * useEffect(() => unsubscribe, []);
 * ```
 * 
 * @example Project-Specific Filtering
 * ```typescript
 * // Subscribe to tasks for a specific project
 * const unsubscribe = subscriptionManager.subscribe(
 *   { 
 *     table: 'tasks', 
 *     event: '*', 
 *     filter: { project_id: 'project-123' } 
 *   },
 *   handleTaskUpdate
 * );
 * ```
 */
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
   * This enables automatic deduplication of subscriptions
   */
  private generateChannelKey(config: SubscriptionConfig): string {
    const { table, event = '*', schema = 'public', filter } = config;
    const filterKey = filter ? JSON.stringify(filter) : '';
    return `${schema}.${table}.${event}.${filterKey}`;
  }

  /**
   * Generate a unique channel name to prevent conflicts
   * Each channel gets a timestamp to ensure uniqueness
   */
  private generateChannelName(config: SubscriptionConfig): string {
    const key = this.generateChannelKey(config);
    const timestamp = Date.now();
    return `subscription-${key.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;
  }

  /**
   * Subscribe to a table with automatic deduplication
   * 
   * @param config - Subscription configuration (table, event, filters)
   * @param callback - Function to call when data changes
   * @returns Unsubscribe function to clean up the subscription
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

      // Set up real-time listener
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
        if (channelManager) {
          channelManager.status = status;
        }

        if (status === 'CHANNEL_ERROR') {
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
   * Clean up a specific channel and remove it from the manager
   */
  private cleanupChannel(channelKey: string): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      try {
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
   * Used by debug overlay and monitoring tools
   */
  public getChannelStatus(config: SubscriptionConfig): string | null {
    const channelKey = this.generateChannelKey(config);
    const channelManager = this.channels.get(channelKey);
    return channelManager ? channelManager.status : null;
  }

  /**
   * Reconnect a specific channel (useful for error recovery)
   * This will preserve all existing callbacks and re-establish the connection
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
   * Clean up all subscriptions (called during logout)
   * This ensures no memory leaks and proper cleanup
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    // Create a copy of channel keys to avoid mutation during iteration
    const channelKeys = Array.from(this.channels.keys());
    
    channelKeys.forEach(channelKey => {
      this.cleanupChannel(channelKey);
    });
    
    // Clear the channels map
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
   * Returns an array of channel info including config and status
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
