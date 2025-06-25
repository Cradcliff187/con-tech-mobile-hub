
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stakeholder } from '@/types/database';
import { subscriptionManager } from '@/services/subscription';

interface UseImprovedStakeholderSubscriptionProps {
  user: any;
  onStakeholdersUpdate: (stakeholders: Stakeholder[]) => void;
  projectId?: string;
}

export const useImprovedStakeholderSubscription = ({ 
  user, 
  onStakeholdersUpdate,
  projectId 
}: UseImprovedStakeholderSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up stakeholders real-time subscription', { projectId });

    const handleStakeholderChange = async () => {
      try {
        let query = supabase
          .from('stakeholders')
          .select('*')
          .eq('status', 'active')
          .order('contact_person');

        if (projectId) {
          // Get stakeholders assigned to this project
          const { data: assignments } = await supabase
            .from('stakeholder_assignments')
            .select('stakeholder_id')
            .eq('project_id', projectId);
          
          const stakeholderIds = assignments?.map(a => a.stakeholder_id) || [];
          if (stakeholderIds.length > 0) {
            query = query.in('id', stakeholderIds);
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching stakeholders:', error);
          return;
        }

        onStakeholdersUpdate(data || []);
      } catch (error) {
        console.error('Error in stakeholders subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { table: 'stakeholders' },
      handleStakeholderChange
    );

    // Also subscribe to stakeholder_assignments if filtering by project
    let assignmentsUnsubscribe: (() => void) | undefined;
    if (projectId) {
      assignmentsUnsubscribe = subscriptionManager.subscribe(
        { 
          table: 'stakeholder_assignments',
          filter: { project_id: projectId }
        },
        handleStakeholderChange
      );
    }

    // Initial fetch
    handleStakeholderChange();

    return () => {
      console.log('Cleaning up stakeholders subscription');
      unsubscribe?.();
      assignmentsUnsubscribe?.();
    };
  }, [user?.id, onStakeholdersUpdate, projectId]);
};
