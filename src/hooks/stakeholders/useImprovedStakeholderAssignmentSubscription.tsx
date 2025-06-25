
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

interface StakeholderAssignment {
  id: string;
  stakeholder_id: string;
  project_id?: string;
  task_id?: string;
  equipment_id?: string;
  role?: string;
  hourly_rate?: number;
  total_hours?: number;
  total_cost?: number;
  start_date?: string;
  end_date?: string;
  week_start_date?: string;
  status: string;
  notes?: string;
  daily_hours?: any;
  created_at: string;
  updated_at: string;
}

interface UseImprovedStakeholderAssignmentSubscriptionProps {
  user: any;
  onAssignmentsUpdate: (assignments: StakeholderAssignment[]) => void;
  projectId?: string;
}

export const useImprovedStakeholderAssignmentSubscription = ({ 
  user, 
  onAssignmentsUpdate,
  projectId 
}: UseImprovedStakeholderAssignmentSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up stakeholder assignments real-time subscription', { projectId });

    const handleAssignmentChange = async () => {
      try {
        let query = supabase
          .from('stakeholder_assignments')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching stakeholder assignments:', error);
          return;
        }

        onAssignmentsUpdate(data || []);
      } catch (error) {
        console.error('Error in stakeholder assignments subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'stakeholder_assignments',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleAssignmentChange
    );

    // Initial fetch
    handleAssignmentChange();

    return () => {
      console.log('Cleaning up stakeholder assignments subscription');
      unsubscribe?.();
    };
  }, [user?.id, onAssignmentsUpdate, projectId]);
};
