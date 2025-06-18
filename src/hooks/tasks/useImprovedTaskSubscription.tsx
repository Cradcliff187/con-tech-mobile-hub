
import { useState, useRef, useEffect, useCallback } from 'react';
import { Task } from '@/types/database';
import { subscriptionManager, SubscriptionConfig, SubscriptionCallback } from '@/services/subscriptionManager';
import { mapTaskFromDb } from './taskMapping';

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
    if (!user) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setSubscriptionStatus('idle');
      setCurrentTasks([]);
      lastConfigRef.current = '';
      return;
    }

    // Create stable config identifier
    const configKey = `${user.id}-${projectId || 'all'}`;
    
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

    // Configure subscription
    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(projectId && projectId !== 'all' && { filter: { project_id: projectId } })
    };

    // Subscribe with enhanced error handling
    const unsubscribe = subscriptionManager.subscribe(subscriptionConfig, handleTaskUpdate);
    unsubscribeRef.current = unsubscribe;
    lastConfigRef.current = configKey;

    // Monitor subscription status
    const statusInterval = setInterval(() => {
      const status = subscriptionManager.getChannelStatus(subscriptionConfig);
      setSubscriptionStatus(status);
      
      // Auto-reconnect on error with exponential backoff
      if (status === 'CHANNEL_ERROR' && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnect();
          reconnectTimeoutRef.current = null;
        }, 2000); // 2 second delay for reconnect
      }
    }, 1000);

    return () => {
      clearInterval(statusInterval);
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
  }, [user?.id, projectId, handleTaskUpdate]);

  const reconnect = useCallback(async () => {
    if (!user) return;

    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(projectId && projectId !== 'all' && { filter: { project_id: projectId } })
    };

    try {
      await subscriptionManager.reconnectChannel(subscriptionConfig);
      setSubscriptionStatus('reconnecting');
    } catch (error) {
      console.error('Failed to reconnect task subscription:', error);
    }
  }, [user, projectId]);

  return {
    subscriptionStatus,
    reconnect,
    currentTasks
  };
};
