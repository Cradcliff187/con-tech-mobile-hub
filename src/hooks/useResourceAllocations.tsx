
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ResourceAllocation } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface ResourceAllocationMember {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  hours_allocated: number;
  hours_used: number;
  cost_per_hour: number;
  availability: number;
  date?: string;
  tasks?: string[];
}

export const useResourceAllocations = (projectId?: string) => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Subscription management references
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAllocations();
    }, 100);
  }, []);

  const fetchAllocations = useCallback(async () => {
    if (!user) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('stakeholder_assignments')
        .select(`
          *,
          stakeholders(*),
          projects(*)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching resource allocations:', error);
        setAllocations([]);
        return;
      }

      // Transform stakeholder assignments to resource allocations format
      const groupedAllocations = new Map();

      data?.forEach(assignment => {
        const key = `${assignment.project_id}-${assignment.week_start_date || 'no-week'}`;
        const project = assignment.projects;
        
        if (!groupedAllocations.has(key)) {
          groupedAllocations.set(key, {
            id: key,
            project_id: assignment.project_id || '',
            team_name: `${project?.name || 'Unknown Project'} Team`,
            week_start_date: assignment.week_start_date || new Date().toISOString().split('T')[0],
            total_budget: 0,
            total_used: 0,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
            allocation_type: 'weekly' as 'weekly' | 'daily',
            members: [] as ResourceAllocationMember[]
          });
        }

        const allocation = groupedAllocations.get(key);
        
        const member: ResourceAllocationMember = {
          id: assignment.id,
          user_id: assignment.stakeholders?.id,
          name: assignment.stakeholders?.contact_person || 'Unknown Employee',
          role: assignment.role || 'Employee',
          hours_allocated: assignment.total_hours || 0,
          hours_used: Math.floor((assignment.total_hours || 0) * 0.7),
          cost_per_hour: assignment.hourly_rate || 0,
          availability: 85,
          tasks: []
        };

        allocation.members.push(member);
        allocation.total_budget += assignment.total_cost || 0;
        allocation.total_used += member.hours_used * member.cost_per_hour;
      });

      setAllocations(Array.from(groupedAllocations.values()));
    } catch (error) {
      console.error('Error in fetchAllocations:', error);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  // Cleanup subscription function
  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
        console.log('Resource allocations subscription cleaned up');
      } catch (error) {
        console.error('Error cleaning up resource allocations subscription:', error);
      }
      channelRef.current = null;
    }
    isSubscribedRef.current = false;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clean up existing channel before creating new one
    if (channelRef.current) {
      cleanupSubscription();
    }

    if (!user) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    try {
      // Create unique channel name with user ID and timestamp
      const channelName = `stakeholder_assignments_${user.id}_${Date.now()}`;
      
      // Create subscription with unique channel name
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stakeholder_assignments'
          },
          (payload) => {
            console.log('Resource allocations change detected:', payload);
            debouncedFetch();
          }
        )
        .subscribe((status) => {
          console.log('Resource allocations subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Resource allocations subscription error:', status);
            isSubscribedRef.current = false;
          }
        });

      channelRef.current = channel;

      // Initial fetch
      fetchAllocations();

    } catch (error) {
      console.error('Error setting up resource allocations subscription:', error);
      isSubscribedRef.current = false;
    }

    // Cleanup function
    return () => {
      cleanupSubscription();
    };
  }, [user?.id, fetchAllocations, cleanupSubscription, debouncedFetch]);

  const createAllocation = async (allocationData: Partial<ResourceAllocation>) => {
    if (!user) return { error: 'User not authenticated' };
    console.warn('Use stakeholder assignments system for creating new allocations');
    return { error: 'Use stakeholder assignments system for creating new allocations' };
  };

  return {
    allocations,
    loading,
    createAllocation
  };
};
