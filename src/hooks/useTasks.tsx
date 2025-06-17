
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const { user } = useAuth();
  
  // Use ref to track subscription and prevent multiple subscriptions
  const subscriptionRef = useRef<any>(null);
  const channelNameRef = useRef<string>('');

  // Helper function to map database response to Task interface
  const mapTaskFromDb = (dbTask: any): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as Task['status'],
    priority: dbTask.priority as Task['priority'],
    due_date: dbTask.due_date,
    start_date: dbTask.start_date,
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at,
    project_id: dbTask.project_id,
    assignee_id: dbTask.assignee_id,
    assigned_stakeholder_id: dbTask.assigned_stakeholder_id,
    task_type: dbTask.task_type as Task['task_type'],
    required_skills: dbTask.required_skills,
    punch_list_category: dbTask.punch_list_category as Task['punch_list_category'],
    category: dbTask.category,
    estimated_hours: dbTask.estimated_hours,
    actual_hours: dbTask.actual_hours,
    progress: dbTask.progress || 0,
    created_by: dbTask.created_by,
    matches_skills: dbTask.matches_skills,
    converted_from_task_id: dbTask.converted_from_task_id,
    inspection_status: dbTask.inspection_status as Task['inspection_status'],
  });

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      } else {
        const mappedTasks: Task[] = (data || []).map(mapTaskFromDb);
        setTasks(mappedTasks);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to cleanup existing subscription
  const cleanupSubscription = async () => {
    if (subscriptionRef.current) {
      try {
        console.log('Cleaning up existing subscription:', channelNameRef.current);
        await supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        channelNameRef.current = '';
        setSubscriptionStatus('idle');
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
    }
  };

  // Helper function to setup real-time subscription
  const setupSubscription = async () => {
    if (!user || subscriptionRef.current) return;

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
              setTasks(prev => [newTask, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedTask = mapTaskFromDb(payload.new);
              setTasks(prev => prev.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              ));
            } else if (payload.eventType === 'DELETE') {
              setTasks(prev => prev.filter(task => task.id !== payload.old.id));
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
          }
        });

      subscriptionRef.current = subscription;
      
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setSubscriptionStatus('error');
    }
  };

  useEffect(() => {
    if (!user) {
      // Clean up subscription if user logs out
      cleanupSubscription();
      return;
    }

    // Initial fetch
    fetchTasks();

    // Setup subscription with delay to ensure component is stable
    const setupTimer = setTimeout(() => {
      setupSubscription();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(setupTimer);
      cleanupSubscription();
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-runs

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return { error: 'User not authenticated' };

    if (!taskData.title || !taskData.project_id) {
      return { error: 'Task title and project are required' };
    }

    try {
      const { data, error } = await supabase
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
          created_by: user.id,
          assignee_id: taskData.assignee_id,
          assigned_stakeholder_id: taskData.assigned_stakeholder_id,
          task_type: taskData.task_type || 'regular',
          required_skills: taskData.required_skills,
          punch_list_category: taskData.punch_list_category,
          converted_from_task_id: taskData.converted_from_task_id,
          inspection_status: taskData.inspection_status
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }

      // Real-time subscription will handle adding the task to state
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      console.error('Error creating task:', err);
      return { error: errorMessage };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
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

      // Real-time subscription will handle updating the task in state
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      console.error('Error updating task:', err);
      return { error: errorMessage };
    }
  };

  return {
    tasks,
    loading,
    error,
    subscriptionStatus,
    createTask,
    updateTask,
    refetch: fetchTasks
  };
};
