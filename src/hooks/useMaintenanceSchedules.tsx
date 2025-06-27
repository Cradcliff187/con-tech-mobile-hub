import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceSchedule {
  id: string;
  equipment_id: string;
  schedule_name: string;
  task_type: string;
  description?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'hours_based' | 'usage_based';
  frequency_value: number;
  estimated_hours: number;
  is_active: boolean;
  last_generated_date?: string;
  next_due_date?: string;
  auto_assign_to_stakeholder_id?: string;
  checklist_template: any[];
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
    type?: string;
  };
  auto_assign_stakeholder?: {
    id: string;
    contact_person?: string;
    company_name?: string;
  };
}

export const useMaintenanceSchedules = (equipmentId?: string) => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        let query = supabase
          .from('maintenance_schedules')
          .select(`
            *,
            equipment:equipment(id, name, type),
            auto_assign_stakeholder:stakeholders(id, contact_person, company_name)
          `)
          .order('created_at', { ascending: false });

        if (equipmentId) {
          query = query.eq('equipment_id', equipmentId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching maintenance schedules:', error);
          setSchedules([]);
          return;
        }

        // Map the data with proper type casting
        const mappedSchedules = (data || []).map(schedule => ({
          ...schedule,
          frequency_type: schedule.frequency_type as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'hours_based' | 'usage_based',
          checklist_template: Array.isArray(schedule.checklist_template) 
            ? schedule.checklist_template 
            : []
        })) as MaintenanceSchedule[];

        setSchedules(mappedSchedules);
      } catch (error) {
        console.error('Error in fetchSchedules:', error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    // Simple subscription without complex manager
    const channel = supabase
      .channel('maintenance_schedules_simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_schedules'
        },
        () => {
          fetchSchedules();
        }
      )
      .subscribe();

    // Initial fetch
    fetchSchedules();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, equipmentId]); // Direct dependencies only

  const createSchedule = useCallback(async (scheduleData: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert({
          ...scheduleData,
          checklist_template: scheduleData.checklist_template || []
        })
        .select(`
          *,
          equipment:equipment(id, name, type),
          auto_assign_stakeholder:stakeholders(id, contact_person, company_name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance schedule created successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating maintenance schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance schedule",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [user, toast]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<MaintenanceSchedule>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          equipment:equipment(id, name, type),
          auto_assign_stakeholder:stakeholders(id, contact_person, company_name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance schedule updated successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating maintenance schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance schedule",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [user, toast]);

  const deleteSchedule = useCallback(async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance schedule deleted successfully"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting maintenance schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete maintenance schedule",
        variant: "destructive"
      });
      return { error: error.message };
    }
  }, [user, toast]);

  const generateTasks = useCallback(async (scheduleId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Calculate next due date based on frequency
      const nextDueDate = new Date();
      switch (schedule.frequency_type) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + schedule.frequency_value);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + (schedule.frequency_value * 7));
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + schedule.frequency_value);
          break;
        case 'quarterly':
          nextDueDate.setMonth(nextDueDate.getMonth() + (schedule.frequency_value * 3));
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + schedule.frequency_value);
          break;
        default:
          nextDueDate.setDate(nextDueDate.getDate() + 30); // Default to 30 days
      }

      // Create maintenance task
      const { data: taskData, error: taskError } = await supabase
        .from('maintenance_tasks')
        .insert({
          equipment_id: schedule.equipment_id,
          title: `${schedule.schedule_name} - ${schedule.equipment?.name}`,
          description: schedule.description || `Scheduled ${schedule.task_type} maintenance`,
          task_type: schedule.task_type as any,
          priority: 'medium' as any,
          scheduled_date: nextDueDate.toISOString().split('T')[0],
          estimated_hours: schedule.estimated_hours,
          assigned_to: schedule.auto_assign_to_stakeholder_id,
          checklist: schedule.checklist_template
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Update schedule's last generated date and next due date
      await updateSchedule(scheduleId, {
        last_generated_date: new Date().toISOString(),
        next_due_date: nextDueDate.toISOString()
      });

      toast({
        title: "Success",
        description: "Maintenance task generated successfully"
      });

      return { data: taskData, error: null };
    } catch (error: any) {
      console.error('Error generating maintenance task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate maintenance task",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [user, schedules, updateSchedule, toast]);

  return {
    schedules,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateTasks
  };
};
