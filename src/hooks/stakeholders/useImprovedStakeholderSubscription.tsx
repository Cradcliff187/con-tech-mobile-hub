
import { useEffect, useRef } from 'react';
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
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const assignmentsUnsubscribeRef = useRef<(() => void) | null>(null);
  const lastConfigRef = useRef<string>('');

  useEffect(() => {
    if (!user?.id) {
      // Clean up existing subscriptions if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (assignmentsUnsubscribeRef.current) {
        assignmentsUnsubscribeRef.current();
        assignmentsUnsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
      return;
    }

    const configKey = `${user.id}-${projectId || 'all'}`;
    
    // Skip if same config and subscription already exists
    if (lastConfigRef.current === configKey && unsubscribeRef.current) {
      return;
    }

    // Clean up existing subscriptions before creating new ones
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (assignmentsUnsubscribeRef.current) {
      assignmentsUnsubscribeRef.current();
      assignmentsUnsubscribeRef.current = null;
    }

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
          } else {
            // No assignments found, return empty array
            onStakeholdersUpdate([]);
            return;
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
    unsubscribeRef.current = unsubscribe;

    // Also subscribe to stakeholder_assignments if filtering by project
    if (projectId) {
      const assignmentsUnsubscribe = subscriptionManager.subscribe(
        { 
          table: 'stakeholder_assignments',
          filter: { project_id: projectId }
        },
        handleStakeholderChange
      );
      assignmentsUnsubscribeRef.current = assignmentsUnsubscribe;
    }

    lastConfigRef.current = configKey;

    // Initial fetch
    handleStakeholderChange();

    return () => {
      console.log('Cleaning up stakeholders subscription');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (assignmentsUnsubscribeRef.current) {
        assignmentsUnsubscribeRef.current();
        assignmentsUnsubscribeRef.current = null;
      }
      lastConfigRef.current = '';
    };
  }, [user?.id, projectId]); // Only depend on user ID and project ID

  // Handle callback changes without re-subscribing
  useEffect(() => {
    // No need to re-subscribe, just ensure we have the latest callback
  }, [onStakeholdersUpdate]);
};
