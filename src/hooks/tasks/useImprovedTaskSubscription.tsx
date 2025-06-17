
import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/database';
import { subscriptionManager, SubscriptionConfig, SubscriptionCallback } from '@/services/subscriptionManager';
import { mapTaskFromDb } from './taskMapping';

interface UseImprovedTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (updateFn: (prevTasks: Task[]) => Task[]) => void;
  projectId?: string;
}

export const useImprovedTaskSubscription = ({ 
  user, 
  onTasksUpdate, 
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>('idle');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) {
      // Clean up subscription if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setSubscriptionStatus('idle');
      return;
    }

    // Clean up existing subscription before creating new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Configure subscription
    const subscriptionConfig: SubscriptionConfig = {
      table: 'tasks',
      event: '*',
      schema: 'public',
      ...(projectId && { filter: { project_id: projectId } })
    };

    console.log('Setting up improved task subscription', { 
      userId: user.id, 
      projectId, 
      hasFilter: !!projectId 
    });

    // Create subscription callback
    const handleTaskUpdate: SubscriptionCallback = (payload) => {
      console.log('Task real-time update:', payload.eventType, payload.new?.id || payload.old?.id);

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
        onTasksUpdate(prev => prev.filter(task => task.id !== payload.old.id));
      }
    };

    // Subscribe using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(subscriptionConfig, handleTaskUpdate);
    unsubscribeRef.current = unsubscribe;

    // Update status based on subscription manager
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
    };
  }, [user?.id, projectId]); // Re-run when user or project changes

  // Reconnect function for error recovery
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
      console.log('Task subscription reconnected successfully');
    } catch (error) {
      console.error('Failed to reconnect task subscription:', error);
    }
  };

  return {
    subscriptionStatus,
    reconnect
  };
};
