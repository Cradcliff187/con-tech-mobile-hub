
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

interface EquipmentAllocation {
  id: string;
  equipment_id: string;
  project_id: string;
  task_id?: string;
  operator_id?: string;
  operator_type?: string;
  start_date: string;
  end_date: string;
  notes?: string;
  allocated_by?: string;
  created_at: string;
  updated_at: string;
}

interface UseImprovedEquipmentAllocationSubscriptionProps {
  user: any;
  onAllocationsUpdate: (allocations: EquipmentAllocation[]) => void;
  projectId?: string;
  equipmentId?: string;
}

export const useImprovedEquipmentAllocationSubscription = ({ 
  user, 
  onAllocationsUpdate,
  projectId,
  equipmentId 
}: UseImprovedEquipmentAllocationSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up equipment allocations real-time subscription', { projectId, equipmentId });

    const handleAllocationChange = async () => {
      try {
        let query = supabase
          .from('equipment_allocations')
          .select('*')
          .order('start_date', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        if (equipmentId) {
          query = query.eq('equipment_id', equipmentId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching equipment allocations:', error);
          return;
        }

        onAllocationsUpdate(data || []);
      } catch (error) {
        console.error('Error in equipment allocations subscription handler:', error);
      }
    };

    // Build filter for subscription
    const filter: Record<string, any> = {};
    if (projectId) filter.project_id = projectId;
    if (equipmentId) filter.equipment_id = equipmentId;

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'equipment_allocations',
        filter: Object.keys(filter).length > 0 ? filter : undefined
      },
      handleAllocationChange
    );

    // Initial fetch
    handleAllocationChange();

    return () => {
      console.log('Cleaning up equipment allocations subscription');
      unsubscribe?.();
    };
  }, [user?.id, onAllocationsUpdate, projectId, equipmentId]);
};
