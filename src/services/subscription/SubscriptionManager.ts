
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionConfig, SubscriptionCallback, ChannelManager } from './types';
import { generateChannelKey, generateChannelName, formatFilterForSupabase } from './channelUtils';
import { SubscriptionErrorHandler } from './errorHandling';

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeChannels: number;
  reconnectionAttempts: number;
  connectionErrors: number;
  lastHealthCheck: Date;
}

/**
 * Enhanced Centralized Subscription Manager with connection pooling and health monitoring
 */
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private channels: Map<string, ChannelManager> = new Map();
  private isCleaningUp: boolean = false;
  private errorHandler: SubscriptionErrorHandler = new SubscriptionErrorHandler();
  private metrics: SubscriptionMetrics = {
    totalSubscriptions: 0,
    activeChannels: 0,
    reconnectionAttempts: 0,
    connectionErrors: 0,
    lastHealthCheck: new Date()
  };

  // Connection pool configuration
  private readonly MAX_CHANNELS = 10;
  private readonly HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHealthMonitoring();
  }

  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  /**
   * Start health monitoring for all channels
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Perform health check on all active channels
   */
  private performHealthCheck(): void {
    this.metrics.lastHealthCheck = new Date();
    this.metrics.activeChannels = this.channels.size;
    
    // Check for stale channels and cleanup
    const staleChannels: string[] = [];
    
    this.channels.forEach((manager, key) => {
      if (manager.callbacks.size === 0) {
        staleChannels.push(key);
      }
    });

    // Cleanup stale channels
    staleChannels.forEach(key => {
      this.cleanupChannel(key);
    });

    // Log health status in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Subscription Health:', this.getHealthStatus());
    }
  }

  /**
   * Subscribe to a table with connection pooling and deduplication
   */
  public subscribe<T = any>(
    config: SubscriptionConfig,
    callback: SubscriptionCallback<T>
  ): () => void {
    if (this.isCleaningUp) {
      console.warn('Cannot subscribe during cleanup process');
      return () => {};
    }

    // Check connection pool limits
    if (this.channels.size >= this.MAX_CHANNELS) {
      console.warn(`Maximum channel limit (${this.MAX_CHANNELS}) reached. Consider optimizing subscriptions.`);
    }

    const channelKey = generateChannelKey(config);
    let channelManager = this.channels.get(channelKey);

    // If channel doesn't exist, create it
    if (!channelManager) {
      channelManager = this.createChannel(config, channelKey);
      this.channels.set(channelKey, channelManager);
      this.metrics.totalSubscriptions++;
    }

    // Add callback to the channel
    channelManager.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      const manager = this.channels.get(channelKey);
      if (manager) {
        manager.callbacks.delete(callback);
        
        // If no more callbacks, schedule cleanup with debouncing
        if (manager.callbacks.size === 0) {
          setTimeout(() => {
            const currentManager = this.channels.get(channelKey);
            if (currentManager && currentManager.callbacks.size === 0) {
              this.cleanupChannel(channelKey);
            }
          }, 1000);
        }
      }
    };
  }

  /**
   * Create a new channel with enhanced configuration
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

    // Add filter if provided
    if (filter && Object.keys(filter).length > 0) {
      const filterString = formatFilterForSupabase(filter);
      if (filterString) {
        postgresChangesConfig.filter = filterString;
      }
    }

    // Set up real-time listener with enhanced error handling
    channel.on('postgres_changes', postgresChangesConfig, (payload) => {
      channelManager.callbacks.forEach(cb => {
        try {
          cb(payload);
        } catch (error) {
          console.error('Error in subscription callback:', error);
          this.metrics.connectionErrors++;
        }
      });
    });

    // Enhanced subscription status handling
    channel.subscribe((status) => {
      channelManager.status = status;

      if (status === 'CHANNEL_ERROR') {
        console.error(`Channel error for ${channelKey}, initiating retry...`);
        this.metrics.connectionErrors++;
        this.errorHandler.handleChannelError(
          channelKey,
          config,
          (key, cfg) => {
            this.metrics.reconnectionAttempts++;
            this.reconnectChannelInternal(key, cfg);
          },
          (key) => this.cleanupChannel(key)
        );
      } else if (status === 'SUBSCRIBED') {
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
      
      this.cleanupChannel(channelKey);
      
      callbacks.forEach(callback => {
        this.subscribe(config, callback);
      });
    }
  }

  /**
   * Clean up a specific channel
   */
  private cleanupChannel(channelKey: string): void {
    const channelManager = this.channels.get(channelKey);
    if (channelManager) {
      try {
        supabase.removeChannel(channelManager.channel);
      } catch (error) {
        console.warn(`Error cleaning up channel ${channelKey}:`, error);
      }
      
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
   * Get health status and metrics
   */
  public getHealthStatus() {
    return {
      ...this.metrics,
      channelUtilization: `${this.channels.size}/${this.MAX_CHANNELS}`,
      isHealthy: this.channels.size < this.MAX_CHANNELS && this.metrics.connectionErrors < 5
    };
  }

  /**
   * Get active channel count
   */
  public getActiveChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Get detailed channel information
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
   * Clean up all subscriptions
   */
  public unsubscribeAll(): void {
    this.isCleaningUp = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.errorHandler.cleanupAll();
    
    const channelKeys = Array.from(this.channels.keys());
    channelKeys.forEach(channelKey => {
      this.cleanupChannel(channelKey);
    });
    
    this.channels.clear();
    this.isCleaningUp = false;
  }
}
