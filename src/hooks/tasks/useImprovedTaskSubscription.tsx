
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { subscriptionManager } from '@/services/subscription';

interface UseImprovedTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (tasks: Task[]) => void;
  projectId?: string;
}

export const useImprovedTaskSubscription = ({ 
  user, 
  onTasksUpdate,
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastConfigRef = useRef<string>('');

  useEffect(() => {
    if (!user?.id) {
      // Clean up existing subscription if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
      return;
    }

    const configKey = `${user.id}-${projectId || 'all'}`;
    
    // Skip if same config and subscription already exists
    if (lastConfigRef.current === configKey && unsubscribeRef.current) {
      return;
    }

    // Clean up existing subscription before creating new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const handleTaskChange = async () => {
      try {
        let query = supabase
          .from('tasks')
          .select(`
            *,
            assignee:profiles!assignee_id(
              id,
              full_name,
              email,
              avatar_url
            ),
            project:projects!project_id(
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching tasks:', error);
          return;
        }

        onTasksUpdate(data || []);
      } catch (error) {
        console.error('Error in tasks subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'tasks',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleTaskChange
    );

    unsubscribeRef.current = unsubscribe;
    lastConfigRef.current = configKey;

    // Initial fetch
    handleTaskChange();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
    };
  }, [user?.id, projectId]);

  // Handle callback changes without re-subscribing
  useEffect(() => {
    // No need to re-subscribe, just ensure we have the latest callback
  }, [onTasksUpdate]);
};
