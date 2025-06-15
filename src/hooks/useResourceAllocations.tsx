
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  hours_allocated: number;
  hours_used: number;
  cost_per_hour: number;
  availability: number;
  tasks: string[];
  stakeholder_id?: string;
}

interface ResourceAllocation {
  id: string;
  project_id: string;
  team_name: string;
  total_budget: number;
  total_used: number;
  week_start_date: string;
  members: TeamMember[];
}

export const useResourceAllocations = (projectId?: string) => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllocations = async () => {
    if (!user) return;

    setLoading(true);
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
      } else {
        setAllocations(data || []);
      }
    } catch (error) {
      console.error('Error fetching resource allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [user, projectId]);

  const createAllocation = async (allocationData: Partial<ResourceAllocation>) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('resource_allocations')
      .insert({
        project_id: allocationData.project_id,
        team_name: allocationData.team_name,
        total_budget: allocationData.total_budget || 0,
        total_used: allocationData.total_used || 0,
        week_start_date: allocationData.week_start_date
      })
      .select()
      .single();

    if (!error && data) {
      fetchAllocations();
    }

    return { data, error };
  };

  return {
    allocations,
    loading,
    createAllocation,
    refetch: fetchAllocations
  };
};
