
export { SubscriptionManager } from './SubscriptionManager';
export type { SubscriptionConfig, SubscriptionCallback, ChannelManager } from './types';

// Import the class to create the singleton instance
import { SubscriptionManager } from './SubscriptionManager';

// Export the singleton instance
export const subscriptionManager = SubscriptionManager.getInstance();
