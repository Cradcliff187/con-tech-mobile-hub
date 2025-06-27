
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { subscriptionManager } from '@/services/subscription';

interface UseImprovedTaskSubscriptionProps {
  sessionReady: boolean;
  onTasksUpdate: (tasks: Task[]) => void;
  projectId?: string;
}

export const useImprovedTaskSubscription = ({ 
  sessionReady,
  onTasksUpdate,
  projectId 
}: UseImprovedTaskSubscriptionProps) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastConfigRef = useRef<string>('');

  useEffect(() => {
    if (!sessionReady) {
      // Clean up existing subscription if session is not ready
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
      return;
    }

    const configKey = `tasks-${projectId || 'all'}`;
    
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

        // Transform the data to ensure task_type is properly typed
        const transformedTasks = (data || []).map(task => ({
          ...task,
          task_type: task.task_type === 'punch_list' ? 'punch_list' as const : 'regular' as const
        }));

        onTasksUpdate(transformedTasks as Task[]);
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
  }, [sessionReady, projectId]);

  // Handle callback changes without re-subscribing
  useEffect(() => {
    // No need to re-subscribe, just ensure we have the latest callback
  }, [onTasksUpdate]);
};
