
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface UseTasksOptions {
  projectId?: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { projectId } = options;

  // Subscription management references
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize session readiness to prevent unnecessary re-computations
  const isSessionReady = useMemo(() => {
    const ready = !!user && !!profile;
    return ready;
  }, [user?.id, profile?.id]); // Only depend on IDs to prevent object reference changes

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchTasks();
    }, 100);
  }, []);

  // Stable fetch function that doesn't change on every render
  const fetchTasks = useCallback(async () => {
    if (!isSessionReady) {
      setTasks([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
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

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      const mappedTasks = (data || []).map(task => ({
        ...task,
        task_type: task.task_type === 'punch_list' ? 'punch_list' as const : 'regular' as const
      })) as Task[];

      setTasks(mappedTasks);
      return mappedTasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      console.error('Error fetching tasks:', errorMessage);
      setError(errorMessage);
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isSessionReady]);

  // Cleanup subscription function
  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
        console.log('Tasks subscription cleaned up');
      } catch (error) {
        console.error('Error cleaning up subscription:', error);
      }
      channelRef.current = null;
    }
    isSubscribedRef.current = false;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    if (!isSessionReady) return { error: 'Session not ready' };

    if (!taskData.title || !taskData.project_id) {
      return { error: 'Task title and project are required' };
    }

    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          project_id: taskData.project_id,
          description: taskData.description,
          status: taskData.status || 'not-started',
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          category: taskData.category,
          estimated_hours: taskData.estimated_hours,
          actual_hours: taskData.actual_hours,
          progress: taskData.progress || 0,
          created_by: user!.id,
          assignee_id: taskData.assignee_id,
          task_type: taskData.task_type || 'regular',
          required_skills: taskData.required_skills,
          punch_list_category: taskData.punch_list_category,
          converted_from_task_id: taskData.converted_from_task_id,
          inspection_status: taskData.inspection_status
        })
        .select()
        .single();

      if (taskError) {
        throw new Error(`Failed to create task: ${taskError.message}`);
      }

      // Real-time subscription will handle state update
      return { data: task, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      console.error('Error creating task:', err);
      return { error: errorMessage };
    }
  }, [user, isSessionReady]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!isSessionReady) return { error: 'Session not ready' };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      // Real-time subscription will handle state update
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      console.error('Error updating task:', err);
      return { error: errorMessage };
    }
  }, [isSessionReady]);

  // Set up subscription with proper cleanup and stable references
  useEffect(() => {
    // Clean up existing channel before creating new one
    if (channelRef.current) {
      cleanupSubscription();
    }

    if (!isSessionReady) {
      setLoading(false);
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    try {
      // Create unique channel name with user ID and timestamp
      const channelName = `tasks_${user!.id}_${Date.now()}`;
      
      // Create subscription with unique channel name
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks'
          },
          (payload) => {
            console.log('Tasks change detected:', payload);
            debouncedFetch();
          }
        )
        .subscribe((status) => {
          console.log('Tasks subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Tasks subscription error:', status);
            isSubscribedRef.current = false;
          }
        });

      channelRef.current = channel;

      // Initial fetch
      fetchTasks();

    } catch (error) {
      console.error('Error setting up tasks subscription:', error);
      isSubscribedRef.current = false;
    }

    // Cleanup function
    return () => {
      cleanupSubscription();
    };
  }, [isSessionReady, user?.id, cleanupSubscription, debouncedFetch, fetchTasks]);

  // Filter tasks by project if specified
  const filteredTasks = useMemo(() => {
    if (projectId && projectId !== 'all') {
      return tasks.filter(task => task.project_id === projectId);
    }
    return tasks;
  }, [tasks, projectId]);

  const refetch = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: filteredTasks,
    loading: loading || !isSessionReady,
    error,
    createTask,
    updateTask,
    refetch
  };
};
