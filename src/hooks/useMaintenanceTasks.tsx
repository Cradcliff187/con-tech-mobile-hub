
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceTask {
  id: string;
  equipment_id: string;
  title: string;
  description?: string;
  task_type: 'routine' | 'repair' | 'inspection' | 'calibration' | 'safety_check';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  scheduled_date: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to_stakeholder_id?: string;
  assigned_to_user_id?: string;
  created_by?: string;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  checklist_items: any[];
  created_at: string;
  updated_at: string;
  // Relations
  equipment?: {
    id: string;
    name: string;
    type?: string;
  };
  assigned_stakeholder?: {
    id: string;
    contact_person?: string;
    company_name?: string;
  };
  assigned_user?: {
    id: string;
    full_name?: string;
  };
}

export const useMaintenanceTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          *,
          equipment(id, name, type),
          stakeholders(id, contact_person, company_name)
        `)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load maintenance tasks",
          variant: "destructive"
        });
      } else {
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
        setTasks(normalizedTasks);
      }
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    equipment_id: string;
    title: string;
    description?: string;
    task_type?: string;
    priority?: string;
    scheduled_date: string;
    estimated_hours?: number;
    assigned_to_stakeholder_id?: string;
    assigned_to_user_id?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert({
          ...taskData,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance task created successfully"
      });

      await fetchTasks();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to create maintenance task",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance task updated successfully"
      });

      await fetchTasks();
      return { error: null };
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  const completeTask = async (id: string, actualHours?: number, notes?: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id,
          actual_hours: actualHours,
          notes: notes
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance task completed successfully"
      });

      await fetchTasks();
      return { error: null };
    } catch (error) {
      console.error('Error completing maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to complete maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance task deleted successfully"
      });

      await fetchTasks();
      return { error: null };
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to delete maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    refetch: fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  };
};
