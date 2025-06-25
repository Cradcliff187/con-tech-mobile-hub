
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

interface MaintenanceTask {
  id: string;
  equipment_id: string;
  title: string;
  description?: string;
  task_type: string;
  priority: string;
  status: string;
  scheduled_date: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to_user_id?: string;
  assigned_to_stakeholder_id?: string;
  created_by?: string;
  completed_by?: string;
  notes?: string;
  checklist_items?: any[];
  created_at: string;
  updated_at: string;
}

interface UseImprovedMaintenanceTaskSubscriptionProps {
  user: any;
  onTasksUpdate: (tasks: MaintenanceTask[]) => void;
  equipmentId?: string;
}

export const useImprovedMaintenanceTaskSubscription = ({ 
  user, 
  onTasksUpdate,
  equipmentId 
}: UseImprovedMaintenanceTaskSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up maintenance tasks real-time subscription', { equipmentId });

    const handleTaskChange = async () => {
      try {
        let query = supabase
          .from('maintenance_tasks')
          .select('*')
          .order('scheduled_date', { ascending: false });

        if (equipmentId) {
          query = query.eq('equipment_id', equipmentId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching maintenance tasks:', error);
          return;
        }

        onTasksUpdate(data || []);
      } catch (error) {
        console.error('Error in maintenance tasks subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'maintenance_tasks',
        filter: equipmentId ? { equipment_id: equipmentId } : undefined
      },
      handleTaskChange
    );

    // Initial fetch
    handleTaskChange();

    return () => {
      console.log('Cleaning up maintenance tasks subscription');
      unsubscribe?.();
    };
  }, [user?.id, onTasksUpdate, equipmentId]);
};
