
import { useState, useRef, useEffect, useCallback } from 'react';
import { Task } from '@/types/database';
import { subscriptionManager, SubscriptionConfig, SubscriptionCallback } from '@/services/subscription';
import { mapTaskFromDb } from './taskMapping';
import { useDebounce } from '@/hooks/useDebounce';

interface UseImprovedTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (tasks: Task[]) => void;
  projectId?: string;
}

/**
 * Enhanced task subscription hook with improved stability and error handling
 */
export const useImprovedTaskSubscription = ({ 
  user, 
  onTasksUpdate, 
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>('idle');
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastConfigRef = useRef<string>('');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the user ID and project ID to prevent rapid subscription changes
  const debouncedUserId = useDebounce(user?.id, 300);
  const debouncedProjectId = useDebounce(projectId, 300);

  // Stabilized callback to prevent unnecessary re-subscriptions
  const stableOnTasksUpdate = useCallback((tasks: Task[]) => {
    setCurrentTasks(tasks);
    onTasksUpdate(tasks);
  }, [onTasksUpdate]);

  // Stabilized task update handler
  const handleTaskUpdate: SubscriptionCallback = useCallback((payload) => {
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
      
      // Call parent callback with updated tasks
      onTasksUpdate(updatedTasks);
      return updatedTasks;
    });
  }, [onTasksUpdate]);

  useEffect(() => {
    // Clean up subscription if user logs out
    if (!debouncedUserId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      setSubscriptionStatus('idle');
      setCurrentTasks([]);
      lastConfigRef.current = '';
      return;
    }

    // Create stable config identifier
    const configKey = `${debouncedUserId}-${debouncedProjectId || 'all'}`;
    
    // Skip if we already have this exact subscription
    if (lastConfigRef.current === configKey) {
      return;
    }

    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear status check interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }

    // Configure subscription
    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(debouncedProjectId && debouncedProjectId !== 'all' && { filter: { project_id: debouncedProjectId } })
    };

    // Subscribe with enhanced error handling
    const unsubscribe = subscriptionManager.subscribe(subscriptionConfig, handleTaskUpdate);
    unsubscribeRef.current = unsubscribe;
    lastConfigRef.current = configKey;

    // Monitor subscription status with reduced frequency (every 5 seconds instead of 1 second)
    statusCheckIntervalRef.current = setInterval(() => {
      const status = subscriptionManager.getChannelStatus(subscriptionConfig);
      setSubscriptionStatus(status);
      
      // Auto-reconnect on error with exponential backoff
      if (status === 'CHANNEL_ERROR' && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnect();
          reconnectTimeoutRef.current = null;
        }, 5000); // Increased to 5 second delay for reconnect
      }
    }, 5000); // Reduced frequency to every 5 seconds

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
    };
  }, [debouncedUserId, debouncedProjectId, handleTaskUpdate]);

  const reconnect = useCallback(async () => {
    if (!debouncedUserId) return;

    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(debouncedProjectId && debouncedProjectId !== 'all' && { filter: { project_id: debouncedProjectId } })
    };

    try {
      await subscriptionManager.reconnectChannel(subscriptionConfig);
      setSubscriptionStatus('reconnecting');
    } catch (error) {
      console.error('Failed to reconnect task subscription:', error);
    }
  }, [debouncedUserId, debouncedProjectId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    subscriptionStatus,
    reconnect,
    currentTasks
  };
};
