
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceAllocation, TeamMember } from '@/types/database';
import { subscriptionManager } from '@/services/subscription';

interface UseImprovedResourceAllocationSubscriptionProps {
  user: any;
  onResourceAllocationsUpdate: (allocations: ResourceAllocation[]) => void;
  projectId?: string;
}

export const useImprovedResourceAllocationSubscription = ({ 
  user, 
  onResourceAllocationsUpdate,
  projectId 
}: UseImprovedResourceAllocationSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up resource allocations real-time subscription', { projectId });

    const handleResourceAllocationChange = async () => {
      try {
        let query = supabase
          .from('resource_allocations')
          .select(`
            *,
            members:team_members(*)
          `)
          .order('week_start_date', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching resource allocations:', error);
          return;
        }

        // Type cast the data to match ResourceAllocation interface
        const typedAllocations = (data || []).map(allocation => ({
          ...allocation,
          allocation_type: (allocation.allocation_type === 'daily' || allocation.allocation_type === 'weekly') 
            ? allocation.allocation_type 
            : 'weekly' as 'weekly' | 'daily'
        })) as ResourceAllocation[];

        onResourceAllocationsUpdate(typedAllocations);
      } catch (error) {
        console.error('Error in resource allocations subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'resource_allocations',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleResourceAllocationChange
    );

    // Also subscribe to team_members changes
    const teamMembersUnsubscribe = subscriptionManager.subscribe(
      { table: 'team_members' },
      handleResourceAllocationChange
    );

    // Initial fetch
    handleResourceAllocationChange();

    return () => {
      console.log('Cleaning up resource allocations subscription');
      unsubscribe?.();
      teamMembersUnsubscribe?.();
    };
  }, [user?.id, onResourceAllocationsUpdate, projectId]);
};
