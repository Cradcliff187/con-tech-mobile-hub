
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';
import { MaintenanceTask } from '@/types/maintenance';

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

        // Type cast the data to match MaintenanceTask interface
        const typedTasks = (data || []).map(task => ({
          ...task,
          checklist_items: Array.isArray(task.checklist_items) 
            ? task.checklist_items 
            : typeof task.checklist_items === 'string' 
              ? JSON.parse(task.checklist_items) 
              : []
        })) as MaintenanceTask[];

        onTasksUpdate(typedTasks);
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
