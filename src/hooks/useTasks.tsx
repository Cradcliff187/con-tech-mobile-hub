
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';

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
      // Map the database response to our Task interface
      const mappedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as Task['status'],
        priority: task.priority as Task['priority'],
        due_date: task.due_date,
        start_date: task.start_date,
        created_at: task.created_at,
        updated_at: task.updated_at,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        assigned_stakeholder_id: task.assigned_stakeholder_id,
        task_type: task.task_type as Task['task_type'],
        required_skills: task.required_skills,
        punch_list_category: task.punch_list_category as Task['punch_list_category'],
        category: task.category,
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours,
        progress: task.progress || 0,
        created_by: task.created_by
      }));
      setTasks(mappedTasks);
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
        punch_list_category: taskData.punch_list_category
      })
      .select()
      .single();

    if (!error && data) {
      const mappedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as Task['status'],
        priority: data.priority as Task['priority'],
        due_date: data.due_date,
        start_date: data.start_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        project_id: data.project_id,
        assignee_id: data.assignee_id,
        assigned_stakeholder_id: data.assigned_stakeholder_id,
        task_type: data.task_type as Task['task_type'],
        required_skills: data.required_skills,
        punch_list_category: data.punch_list_category as Task['punch_list_category'],
        category: data.category,
        estimated_hours: data.estimated_hours,
        actual_hours: data.actual_hours,
        progress: data.progress || 0,
        created_by: data.created_by
      };
      setTasks(prev => [mappedTask, ...prev]);
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
      const mappedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as Task['status'],
        priority: data.priority as Task['priority'],
        due_date: data.due_date,
        start_date: data.start_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        project_id: data.project_id,
        assignee_id: data.assignee_id,
        assigned_stakeholder_id: data.assigned_stakeholder_id,
        task_type: data.task_type as Task['task_type'],
        required_skills: data.required_skills,
        punch_list_category: data.punch_list_category as Task['punch_list_category'],
        category: data.category,
        estimated_hours: data.estimated_hours,
        actual_hours: data.actual_hours,
        progress: data.progress || 0,
        created_by: data.created_by
      };
      setTasks(prev => prev.map(task => task.id === id ? mappedTask : task));
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
