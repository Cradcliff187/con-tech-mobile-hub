import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceSchedule {
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
  // Relations
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

export const useMaintenanceSchedules = () => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSchedules = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          equipment:equipment(id, name, type),
          auto_assign_stakeholder:stakeholders(id, contact_person, company_name)
        `)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load maintenance schedules",
          variant: "destructive"
        });
      } else {
        // Type cast frequency_type and handle JSON properly
        const normalizedSchedules = (data || []).map(schedule => ({
          ...schedule,
          frequency_type: schedule.frequency_type as MaintenanceSchedule['frequency_type'],
          checklist_template: Array.isArray(schedule.checklist_template) ? schedule.checklist_template : []
        }));
        setSchedules(normalizedSchedules);
      }
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: {
    equipment_id: string;
    schedule_name: string;
    task_type?: string;
    description?: string;
    frequency_type: string;
    frequency_value: number;
    estimated_hours?: number;
    auto_assign_to_stakeholder_id?: string;
    checklist_template?: any[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert(scheduleData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance schedule created successfully"
      });

      await fetchSchedules();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create maintenance schedule",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateSchedule = async (id: string, updates: Partial<MaintenanceSchedule>) => {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance schedule updated successfully"
      });

      await fetchSchedules();
      return { error: null };
    } catch (error) {
      console.error('Error updating maintenance schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance schedule",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteSchedule = async (id: string) => {
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

      await fetchSchedules();
      return { error: null };
    } catch (error) {
      console.error('Error deleting maintenance schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete maintenance schedule",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  return {
    schedules,
    loading,
    refetch: fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
};
