
import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/database';
import { subscriptionManager, SubscriptionConfig, SubscriptionCallback } from '@/services/subscriptionManager';
import { mapTaskFromDb } from './taskMapping';

interface UseImprovedTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (updateFn: (prevTasks: Task[]) => Task[]) => void;
  projectId?: string;
}

/**
 * Enhanced task subscription hook using the centralized subscription manager
 * 
 * This hook provides real-time task updates with the following features:
 * - Automatic deduplication of subscriptions
 * - Project-specific filtering
 * - Proper cleanup on user logout
 * - Status monitoring for debug overlay
 * - Optimistic update handling
 * 
 * @example
 * ```typescript
 * const { subscriptionStatus, reconnect } = useImprovedTaskSubscription({
 *   user,
 *   onTasksUpdate: setTasks,
 *   projectId: 'project-123' // Optional: filter by project
 * });
 * ```
 */
export const useImprovedTaskSubscription = ({ 
  user, 
  onTasksUpdate, 
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>('idle');
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastConfigRef = useRef<string>('');

  useEffect(() => {
    // Clean up subscription if user logs out
    if (!user) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setSubscriptionStatus('idle');
      lastConfigRef.current = '';
      return;
    }

    // Create a stable config identifier to prevent duplicate subscriptions
    const configKey = `${user.id}-${projectId || 'all'}`;
    
    // Skip if we already have this exact subscription
    if (lastConfigRef.current === configKey) {
      return;
    }

    // Clean up existing subscription before creating new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Configure subscription with optional project filtering
    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(projectId && { filter: { project_id: projectId } })
    };

    /**
     * Handle real-time task updates with optimistic UI updates
     * Supports INSERT, UPDATE, and DELETE operations
     */
    const handleTaskUpdate: SubscriptionCallback = (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newTask = mapTaskFromDb(payload.new);
        onTasksUpdate(prev => {
          // Prevent duplicates
          const exists = prev.some(task => task.id === newTask.id);
          if (exists) return prev;
          return [newTask, ...prev];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedTask = mapTaskFromDb(payload.new);
        onTasksUpdate(prev => prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        onTasksUpdate(prev => prev.filter(task => task.id !== (payload.old as any).id));
      }
    };

    // Subscribe using the centralized subscription manager
    const unsubscribe = subscriptionManager.subscribe(subscriptionConfig, handleTaskUpdate);
    unsubscribeRef.current = unsubscribe;
    lastConfigRef.current = configKey;

    // Monitor subscription status for debug overlay
    const checkStatus = () => {
      const status = subscriptionManager.getChannelStatus(subscriptionConfig);
      setSubscriptionStatus(status);
    };

    // Check status immediately and then periodically
    checkStatus();
    const statusInterval = setInterval(checkStatus, 1000);

    // Cleanup function
    return () => {
      clearInterval(statusInterval);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
    };
  }, [user?.id, projectId]);

  /**
   * Manually reconnect the subscription (useful for error recovery)
   * This can be called from the debug overlay or error handlers
   */
  const reconnect = async () => {
    if (!user) return;

    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(projectId && { filter: { project_id: projectId } })
    };

    try {
      await subscriptionManager.reconnectChannel(subscriptionConfig);
    } catch (error) {
      console.error('Failed to reconnect task subscription:', error);
    }
  };

  return {
    subscriptionStatus,
    reconnect
  };
};
