
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

interface Equipment {
  id: string;
  name: string;
  type?: string;
  status: string;
  project_id?: string;
  operator_id?: string;
  assigned_operator_id?: string;
  maintenance_due?: string;
  utilization_rate?: number;
  created_at: string;
  updated_at: string;
}

interface UseImprovedEquipmentSubscriptionProps {
  user: any;
  onEquipmentUpdate: (equipment: Equipment[]) => void;
  projectId?: string;
}

export const useImprovedEquipmentSubscription = ({ 
  user, 
  onEquipmentUpdate,
  projectId 
}: UseImprovedEquipmentSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up equipment real-time subscription', { projectId });

    const handleEquipmentChange = async () => {
      try {
        let query = supabase
          .from('equipment')
          .select('*')
          .order('name');

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching equipment:', error);
          return;
        }

        onEquipmentUpdate(data || []);
      } catch (error) {
        console.error('Error in equipment subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'equipment',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleEquipmentChange
    );

    // Initial fetch
    handleEquipmentChange();

    return () => {
      console.log('Cleaning up equipment subscription');
      unsubscribe?.();
    };
  }, [user?.id, onEquipmentUpdate, projectId]);
};
