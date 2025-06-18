
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

export interface ChannelManager {
  channel: RealtimeChannel;
  callbacks: Set<SubscriptionCallback>;
  config: SubscriptionConfig;
  status: string;
}
