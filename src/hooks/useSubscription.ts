import { useState, useEffect, useRef, useCallback } from 'react';
import { subscriptionManager } from '@/services/SubscriptionManager';

interface UseSubscriptionOptions {
  userId?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  enabled?: boolean;
}

interface SubscriptionState {
  isSubscribed: boolean;
  isConnecting: boolean;
  error: string | null;
  retryCount: number;
}

/**
 * React hook that provides a clean interface to the SubscriptionManager
 * 
 * @param tableName - The database table to subscribe to
 * @param callback - Function to call when updates occur  
 * @param options - Additional subscription options
 * @returns Subscription state and utilities
 */
export const useSubscription = (
  tableName: string,
  callback: (payload: any) => void,
  options: UseSubscriptionOptions = {}
) => {
  const { userId, event = '*', enabled = true } = options;
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isConnecting: false,
    error: null,
    retryCount: 0
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback reference up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Handle state changes from SubscriptionManager
  const handleStateChange = useCallback((subscriptionState: string, error?: string) => {
    setState(prevState => ({
      ...prevState,
      isSubscribed: subscriptionState === 'SUBSCRIBED',
      isConnecting: subscriptionState === 'CONNECTING',
      error: error || null,
      retryCount: subscriptionState === 'ERROR' ? prevState.retryCount + 1 : 0
    }));
  }, []);

  // Wrapper callback that uses the latest callback reference
  const stableCallback = useCallback((payload: any) => {
    callbackRef.current(payload);
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up existing subscription if disabled
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setState({
        isSubscribed: false,
        isConnecting: false,
        error: null,
        retryCount: 0
      });
      return;
    }

    // Set connecting state
    setState(prev => ({ ...prev, isConnecting: true }));

    // Subscribe using SubscriptionManager
    const unsubscribe = subscriptionManager.subscribe(
      tableName,
      stableCallback,
      {
        userId,
        event,
        onStateChange: handleStateChange
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [tableName, userId, event, enabled, stableCallback, handleStateChange]);

  // Get subscription info for debugging
  const getSubscriptionInfo = useCallback(() => {
    return subscriptionManager.getSubscriptionInfo(tableName);
  }, [tableName]);

  return {
    ...state,
    getSubscriptionInfo
  };
};
