
export { SubscriptionManager } from './SubscriptionManager';
export type { SubscriptionConfig, SubscriptionCallback, ChannelManager } from './types';

// Export the singleton instance
export const subscriptionManager = SubscriptionManager.getInstance();
