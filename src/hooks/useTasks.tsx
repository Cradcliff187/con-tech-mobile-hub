
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const isSessionReady = !!user && !!profile;

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

      // Refresh tasks after creation
      await fetchTasks();
      return { data: task, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      console.error('Error creating task:', err);
      return { error: errorMessage };
    }
  }, [isSessionReady, user, fetchTasks]);

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

      // Refresh tasks after update
      await fetchTasks();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      console.error('Error updating task:', err);
      return { error: errorMessage };
    }
  }, [isSessionReady, fetchTasks]);

  // Set up simple real-time subscription
  useEffect(() => {
    if (!isSessionReady) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          // Refresh tasks when any change occurs
          fetchTasks();
        }
      )
      .subscribe();

    // Initial fetch
    fetchTasks();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSessionReady, fetchTasks]);

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
