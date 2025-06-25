
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

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

interface UseImprovedMaintenanceScheduleSubscriptionProps {
  user: any;
  onSchedulesUpdate: (schedules: MaintenanceSchedule[]) => void;
  equipmentId?: string;
}

export const useImprovedMaintenanceScheduleSubscription = ({ 
  user, 
  onSchedulesUpdate,
  equipmentId 
}: UseImprovedMaintenanceScheduleSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up maintenance schedules real-time subscription', { equipmentId });

    const handleScheduleChange = async () => {
      try {
        let query = supabase
          .from('maintenance_schedules')
          .select(`
            *,
            equipment:equipment(id, name, type),
            auto_assign_stakeholder:stakeholders(id, contact_person, company_name)
          `)
          .order('next_due_date', { ascending: true });

        if (equipmentId) {
          query = query.eq('equipment_id', equipmentId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching maintenance schedules:', error);
          return;
        }

        // Type cast frequency_type and handle JSON properly
        const normalizedSchedules = (data || []).map(schedule => ({
          ...schedule,
          frequency_type: schedule.frequency_type as MaintenanceSchedule['frequency_type'],
          checklist_template: Array.isArray(schedule.checklist_template) ? schedule.checklist_template : []
        }));

        onSchedulesUpdate(normalizedSchedules);
      } catch (error) {
        console.error('Error in maintenance schedules subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'maintenance_schedules',
        filter: equipmentId ? { equipment_id: equipmentId } : undefined
      },
      handleScheduleChange
    );

    // Initial fetch
    handleScheduleChange();

    return () => {
      console.log('Cleaning up maintenance schedules subscription');
      unsubscribe?.();
    };
  }, [user?.id, onSchedulesUpdate, equipmentId]);
};
