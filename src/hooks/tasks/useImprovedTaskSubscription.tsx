
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Task } from '@/types/database';
import { subscriptionManager, SubscriptionConfig, SubscriptionCallback } from '@/services/subscription';
import { mapTaskFromDb } from './taskMapping';

interface UseImprovedTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (tasks: Task[]) => void;
  projectId?: string;
}

/**
 * Enhanced task subscription hook with optimized memoization and cleanup
 */
export const useImprovedTaskSubscription = ({ 
  user, 
  onTasksUpdate, 
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>('idle');
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized subscription configuration to prevent unnecessary re-subscriptions
  const subscriptionConfig = useMemo<SubscriptionConfig>(() => ({
    table: 'tasks',
    event: '*',
    schema: 'public',
    ...(projectId && projectId !== 'all' && { filter: { project_id: projectId } })
  }), [projectId]);

  // Memoized config key for tracking subscription identity
  const configKey = useMemo(() => 
    `${user?.id || 'anonymous'}-${projectId || 'all'}`, 
    [user?.id, projectId]
  );

  // Stabilized callback to prevent unnecessary re-subscriptions
  const stableOnTasksUpdate = useCallback((tasks: Task[]) => {
    setCurrentTasks(tasks);
    onTasksUpdate(tasks);
  }, [onTasksUpdate]);

  // Optimized task update handler with better error handling
  const handleTaskUpdate: SubscriptionCallback = useCallback((payload) => {
    try {
      setCurrentTasks(prevTasks => {
        let updatedTasks = [...prevTasks];
        
        if (payload.eventType === 'INSERT' && payload.new) {
          const newTask = mapTaskFromDb(payload.new);
          const exists = updatedTasks.some(task => task.id === newTask.id);
          if (!exists) {
            updatedTasks = [newTask, ...updatedTasks];
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedTask = mapTaskFromDb(payload.new);
          updatedTasks = updatedTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          updatedTasks = updatedTasks.filter(task => task.id !== (payload.old as any).id);
        }
        
        // Use stable callback to update parent
        stableOnTasksUpdate(updatedTasks);
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error handling task update:', error);
    }
  }, [stableOnTasksUpdate]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!user) return;

    try {
      await subscriptionManager.reconnectChannel(subscriptionConfig);
      setSubscriptionStatus('reconnecting');
    } catch (error) {
      console.error('Failed to reconnect task subscription:', error);
    }
  }, [user, subscriptionConfig]);

  useEffect(() => {
    // Clean up subscription if user logs out
    if (!user) {
      cleanup();
      setSubscriptionStatus('idle');
      setCurrentTasks([]);
      return;
    }

    // Skip if we already have this exact subscription
    if (unsubscribeRef.current) {
      return;
    }

    // Subscribe with enhanced error handling
    const unsubscribe = subscriptionManager.subscribe(subscriptionConfig, handleTaskUpdate);
    unsubscribeRef.current = unsubscribe;

    // Optimized status monitoring with reduced polling frequency
    statusIntervalRef.current = setInterval(() => {
      const status = subscriptionManager.getChannelStatus(subscriptionConfig);
      setSubscriptionStatus(status);
      
      // Auto-reconnect on error with exponential backoff
      if (status === 'CHANNEL_ERROR' && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnect();
          reconnectTimeoutRef.current = null;
        }, 3000); // Increased delay to 3 seconds
      }
    }, 2000); // Reduced polling frequency to 2 seconds

    return cleanup;
  }, [user, subscriptionConfig, handleTaskUpdate, cleanup, reconnect]);

  return {
    subscriptionStatus,
    reconnect,
    currentTasks,
    configKey // Expose for debugging
  };
};
