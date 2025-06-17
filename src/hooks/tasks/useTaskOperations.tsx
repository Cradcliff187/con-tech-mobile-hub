
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export const useTaskOperations = (user: any) => {
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
    createTask,
    updateTask
  };
};
