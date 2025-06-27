
import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (!user) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    // Simple subscription without complex manager
    const channel = supabase
      .channel('stakeholder_assignments_simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stakeholder_assignments'
        },
        () => {
          fetchAllocations();
        }
      )
      .subscribe();

    // Initial fetch
    fetchAllocations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllocations]);

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
