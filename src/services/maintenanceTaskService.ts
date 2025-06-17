
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, CreateMaintenanceTaskData } from '@/types/maintenance';

export const fetchMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select(`
      *,
      equipment(id, name, type),
      stakeholders(id, contact_person, company_name)
    `)
    .order('scheduled_date', { ascending: true });

  if (error) {
    throw error;
  }

  // Type cast and normalize the data with proper JSON handling and relationship mapping
  const normalizedTasks = (data || []).map(task => {
    // Get the assigned user data separately if needed
    const assignedUser = task.assigned_to_user_id ? { id: task.assigned_to_user_id, full_name: undefined } : undefined;
    
    return {
      ...task,
      task_type: task.task_type as MaintenanceTask['task_type'],
      priority: task.priority as MaintenanceTask['priority'],
      status: task.status as MaintenanceTask['status'],
      checklist_items: Array.isArray(task.checklist_items) ? task.checklist_items : [],
      equipment: task.equipment,
      assigned_stakeholder: task.stakeholders,
      assigned_user: assignedUser
    };
  });

  return normalizedTasks;
};

export const createMaintenanceTask = async (taskData: CreateMaintenanceTaskData, userId: string) => {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .insert({
      ...taskData,
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMaintenanceTask = async (id: string, updates: Partial<MaintenanceTask>) => {
  const { error } = await supabase
    .from('maintenance_tasks')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const completeMaintenanceTask = async (id: string, userId: string, actualHours?: number, notes?: string) => {
  const { error } = await supabase
    .from('maintenance_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: userId,
      actual_hours: actualHours,
      notes: notes
    })
    .eq('id', id);

  if (error) throw error;
};

export const deleteMaintenanceTask = async (id: string) => {
  const { error } = await supabase
    .from('maintenance_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
