
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  due_date?: string;
  assignee_id?: string;
  assigned_stakeholder_id?: string;
  created_by?: string;
  progress: number;
  estimated_hours?: number;
  actual_hours?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return { error: 'User not authenticated' };

    if (!taskData.title || !taskData.project_id) {
      return { error: 'Task title and project are required' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        project_id: taskData.project_id,
        description: taskData.description,
        status: taskData.status || 'not-started',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        category: taskData.category,
        estimated_hours: taskData.estimated_hours,
        progress: taskData.progress || 0,
        created_by: user.id,
        assignee_id: taskData.assignee_id,
        assigned_stakeholder_id: taskData.assigned_stakeholder_id
      })
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => prev.map(task => task.id === id ? data : task));
    }

    return { data, error };
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    refetch: fetchTasks
  };
};
