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
  private reconnectAttempts: Map<string, number> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
   * Fixed to handle filters consistently for proper channel deduplication
   */
  private generateChannelKey(config: SubscriptionConfig): string {
    const { table, event = '*', schema = 'public', filter } = config;
    
    // Create consistent filter key by sorting and formatting
    const filterKey = filter && Object.keys(filter).length > 0 ? 
      Object.entries(filter)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&') : '';
        
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
   * Convert filter object to Supabase's expected string format
   * Supabase expects filters in the format: "key1=eq.value1,key2=eq.value2"
   */
  private formatFilterForSupabase(filter: Record<string, any>): string {
    if (!filter || Object.keys(filter).length === 0) {
      return '';
    }

    return Object.entries(filter)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join(',');
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

      // Configure the channel with proper filter format
      const { table, event = '*', schema = 'public', filter } = config;
      
      let postgresChangesConfig: any = {
        event,
        schema,
        table
      };

      // Add filter if provided - convert to Supabase's expected string format
      if (filter && Object.keys(filter).length > 0) {
        const filterString = this.formatFilterForSupabase(filter);
        if (filterString) {
          postgresChangesConfig.filter = filterString;
        }
      }

      // Set up real-time listener with enhanced error handling
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

      // Enhanced subscription status handling with retry logic
      channel.subscribe((status) => {
        if (channelManager) {
          channelManager.status = status;
        }

        if (status === 'CHANNEL_ERROR') {
          console.error(`Channel error for ${channelKey}, initiating retry...`);
          this.handleChannelError(channelKey, config);
        } else if (status === 'SUBSCRIBED') {
          // Reset reconnect attempts on successful connection
          this.reconnectAttempts.delete(channelKey);
          const timeout = this.reconnectTimeouts.get(channelKey);
          if (timeout) {
            clearTimeout(timeout);
            this.reconnectTimeouts.delete(channelKey);
          }
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
   * Enhanced error handling with exponential backoff retry
   */
  private handleChannelError(channelKey: string, config: SubscriptionConfig): void {
    const currentAttempts = this.reconnectAttempts.get(channelKey) || 0;
    const maxAttempts = 5;
    const baseDelay = 1000; // 1 second

    if (currentAttempts >= maxAttempts) {
      console.error(`Max reconnection attempts reached for ${channelKey}`);
      this.cleanupChannel(channelKey);
      return;
    }

    const delay = baseDelay * Math.pow(2, currentAttempts); // Exponential backoff
    this.reconnectAttempts.set(channelKey, currentAttempts + 1);

    const timeout = setTimeout(() => {
      this.reconnectChannelInternal(channelKey, config);
      this.reconnectTimeouts.delete(channelKey);
    }, delay);

    this.reconnectTimeouts.set(channelKey, timeout);
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
      
      // Clean up retry state
      this.reconnectAttempts.delete(channelKey);
      const timeout = this.reconnectTimeouts.get(channelKey);
      if (timeout) {
        clearTimeout(timeout);
        this.reconnectTimeouts.delete(channelKey);
      }
      
      this.channels.delete(channelKey);
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
    this.reconnectChannelInternal(channelKey, config);
  }

  /**
   * Clean up all subscriptions (called during logout)
   * This ensures no memory leaks and proper cleanup
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    // Clear all timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    this.reconnectAttempts.clear();
    
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
