
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { mapTaskFromDb } from './taskMapping';

interface UseTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (updateFn: (prevTasks: Task[]) => Task[]) => void;
}

export const useTaskSubscription = ({ user, onTasksUpdate }: UseTaskSubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  
  // Use ref to track subscription and prevent multiple subscriptions
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const channelNameRef = useRef<string>('');

  // Helper function to cleanup existing subscription (now synchronous)
  const cleanupSubscription = () => {
    if (subscriptionRef.current) {
      try {
        console.log('Cleaning up existing subscription:', channelNameRef.current);
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        channelNameRef.current = '';
        setSubscriptionStatus('idle');
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
        setSubscriptionStatus('error');
      }
    }
  };

  // Helper function to setup real-time subscription
  const setupSubscription = () => {
    if (!user) return;
    
    // Guard against multiple subscriptions
    if (subscriptionRef.current) {
      console.log('Subscription already exists, skipping setup');
      return;
    }

    try {
      setSubscriptionStatus('connecting');
      
      // Generate unique channel name to prevent conflicts
      const uniqueChannelName = `tasks-changes-${user.id}-${Date.now()}`;
      channelNameRef.current = uniqueChannelName;
      
      console.log('Setting up subscription with channel:', uniqueChannelName);

      const subscription = supabase
        .channel(uniqueChannelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            console.log('Real-time task update:', payload);

            if (payload.eventType === 'INSERT') {
              const newTask = mapTaskFromDb(payload.new);
              onTasksUpdate(prev => [newTask, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedTask = mapTaskFromDb(payload.new);
              onTasksUpdate(prev => prev.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              ));
            } else if (payload.eventType === 'DELETE') {
              onTasksUpdate(prev => prev.filter(task => task.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setSubscriptionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setSubscriptionStatus('error');
            console.error('Channel subscription error');
            // Reset subscription ref on error
            subscriptionRef.current = null;
            channelNameRef.current = '';
          }
        });

      subscriptionRef.current = subscription;
      
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setSubscriptionStatus('error');
      subscriptionRef.current = null;
      channelNameRef.current = '';
    }
  };

  useEffect(() => {
    if (!user) {
      // Clean up subscription if user logs out
      cleanupSubscription();
      return;
    }

    // Setup subscription immediately (removed delay)
    setupSubscription();

    // Cleanup function - immediate cleanup
    return () => {
      cleanupSubscription();
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-runs

  return {
    subscriptionStatus,
    cleanupSubscription
  };
};
