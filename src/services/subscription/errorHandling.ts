
import { SubscriptionConfig } from './types';

/**
 * Error handling utilities for subscription management
 */
export class SubscriptionErrorHandler {
  private reconnectAttempts: Map<string, number> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Enhanced error handling with exponential backoff retry
   */
  handleChannelError(
    channelKey: string, 
    config: SubscriptionConfig,
    reconnectCallback: (channelKey: string, config: SubscriptionConfig) => void,
    cleanupCallback: (channelKey: string) => void
  ): void {
    const currentAttempts = this.reconnectAttempts.get(channelKey) || 0;
    const maxAttempts = 5;
    const baseDelay = 1000; // 1 second

    if (currentAttempts >= maxAttempts) {
      console.error(`Max reconnection attempts reached for ${channelKey}`);
      cleanupCallback(channelKey);
      return;
    }

    const delay = baseDelay * Math.pow(2, currentAttempts); // Exponential backoff
    this.reconnectAttempts.set(channelKey, currentAttempts + 1);

    const timeout = setTimeout(() => {
      reconnectCallback(channelKey, config);
      this.reconnectTimeouts.delete(channelKey);
    }, delay);

    this.reconnectTimeouts.set(channelKey, timeout);
  }

  /**
   * Reset reconnect attempts on successful connection
   */
  resetReconnectAttempts(channelKey: string): void {
    this.reconnectAttempts.delete(channelKey);
    const timeout = this.reconnectTimeouts.get(channelKey);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(channelKey);
    }
  }

  /**
   * Clean up error handling state for a channel
   */
  cleanupErrorState(channelKey: string): void {
    this.reconnectAttempts.delete(channelKey);
    const timeout = this.reconnectTimeouts.get(channelKey);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(channelKey);
    }
  }

  /**
   * Clean up all error handling state
   */
  cleanupAll(): void {
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    this.reconnectAttempts.clear();
  }
}
