
import { SubscriptionConfig } from './types';

/**
 * Generate a unique channel key based on table and filter configuration
 * This enables automatic deduplication of subscriptions
 */
export const generateChannelKey = (config: SubscriptionConfig): string => {
  const { table, event = '*', schema = 'public', filter } = config;
  
  // Create consistent filter key by sorting and formatting
  const filterKey = filter && Object.keys(filter).length > 0 ? 
    Object.entries(filter)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&') : '';
      
  return `${schema}.${table}.${event}.${filterKey}`;
};

/**
 * Generate a unique channel name to prevent conflicts
 * Each channel gets a timestamp to ensure uniqueness
 */
export const generateChannelName = (config: SubscriptionConfig): string => {
  const key = generateChannelKey(config);
  const timestamp = Date.now();
  return `subscription-${key.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;
};

/**
 * Convert filter object to Supabase's expected string format
 * Supabase expects filters in the format: "key1=eq.value1,key2=eq.value2"
 */
export const formatFilterForSupabase = (filter: Record<string, any>): string => {
  if (!filter || Object.keys(filter).length === 0) {
    return '';
  }

  return Object.entries(filter)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join(',');
};
