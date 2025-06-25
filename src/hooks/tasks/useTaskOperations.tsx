
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export const useTaskOperations = (user: any) => {
  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return { error: 'User not authenticated' };

    if (!taskData.title || !taskData.project_id) {
      return { error: 'Task title and project are required' };
    }

    try {
      // Start a transaction by creating the task first
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
          created_by: user.id,
          assignee_id: taskData.assignee_id,
          // Legacy single assignment support
          assigned_stakeholder_id: taskData.assigned_stakeholder_id,
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

      // Handle multiple stakeholder assignments if provided
      const stakeholderIds = taskData.assigned_stakeholder_ids || 
        (taskData.assigned_stakeholder_id ? [taskData.assigned_stakeholder_id] : []);

      if (stakeholderIds.length > 0) {
        const assignments = stakeholderIds.map((stakeholderId, index) => ({
          task_id: task.id,
          stakeholder_id: stakeholderId,
          assignment_role: index === 0 ? 'primary' : 'secondary',
          assigned_by: user.id,
          status: 'active'
        }));

        const { error: assignmentError } = await supabase
          .from('task_stakeholder_assignments')
          .insert(assignments);

        if (assignmentError) {
          // If assignment fails, we should log it but not fail the entire operation
          console.error('Failed to create stakeholder assignments:', assignmentError);
          // Optionally, you could delete the task here if assignments are critical
        }
      }

      // Real-time subscription will handle adding the task to state
      return { data: task, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      console.error('Error creating task:', err);
      return { error: errorMessage };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Handle stakeholder assignment updates
      if (updates.assigned_stakeholder_ids !== undefined) {
        // Remove existing assignments
        await supabase
          .from('task_stakeholder_assignments')
          .delete()
          .eq('task_id', id);

        // Add new assignments if any
        if (updates.assigned_stakeholder_ids.length > 0) {
          const assignments = updates.assigned_stakeholder_ids.map((stakeholderId, index) => ({
            task_id: id,
            stakeholder_id: stakeholderId,
            assignment_role: index === 0 ? 'primary' : 'secondary',
            assigned_by: user.id,
            status: 'active'
          }));

          const { error: assignmentError } = await supabase
            .from('task_stakeholder_assignments')
            .insert(assignments);

          if (assignmentError) {
            console.error('Failed to update stakeholder assignments:', assignmentError);
          }
        }

        // Remove assigned_stakeholder_ids from updates as it's not a task table column
        const { assigned_stakeholder_ids, ...taskUpdates } = updates;
        updates = taskUpdates;
      }

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
