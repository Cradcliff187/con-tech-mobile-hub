
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmployeeResourceMember {
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

interface EmployeeResourceAllocation {
  id: string;
  project_id: string;
  team_name: string;
  week_start_date: string;
  total_budget: number;
  total_used: number;
  created_at: string;
  updated_at: string;
  allocation_type?: 'weekly' | 'daily';
  members?: EmployeeResourceMember[];
}

export const useEmployeeResourceAllocations = (projectId?: string) => {
  const [allocations, setAllocations] = useState<EmployeeResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllocations = async () => {
    if (!user) return;

    console.warn('⚠️ MIGRATION NOTICE: Using new employee assignments system instead of deprecated team_members');

    setLoading(true);
    try {
      // Get stakeholder assignments for employees grouped by project and week
      let query = supabase
        .from('stakeholder_assignments')
        .select(`
          *,
          stakeholders!inner(
            id,
            contact_person,
            stakeholder_type
          ),
          projects(
            id,
            name
          )
        `)
        .eq('stakeholders.stakeholder_type', 'employee')
        .in('status', ['assigned', 'active'])
        .order('week_start_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: assignments, error } = await query;

      if (error) {
        console.error('Error fetching employee assignments:', error);
        return;
      }

      // Group assignments by project and week to mimic resource_allocations structure
      const groupedAllocations = new Map<string, EmployeeResourceAllocation>();

      assignments?.forEach(assignment => {
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
            allocation_type: 'weekly',
            members: []
          });
        }

        const allocation = groupedAllocations.get(key)!;
        
        // Convert assignment to member format
        const member: EmployeeResourceMember = {
          id: assignment.id,
          user_id: assignment.stakeholders?.id,
          name: assignment.stakeholders?.contact_person || 'Unknown Employee',
          role: assignment.role || 'Employee',
          hours_allocated: assignment.total_hours || 0,
          hours_used: Math.floor((assignment.total_hours || 0) * 0.7), // Estimate based on progress
          cost_per_hour: assignment.hourly_rate || 0,
          availability: 85, // Default availability
          tasks: [] // Could be enhanced with related tasks
        };

        allocation.members!.push(member);
        allocation.total_budget += assignment.total_cost || 0;
        allocation.total_used += member.hours_used * member.cost_per_hour;
      });

      setAllocations(Array.from(groupedAllocations.values()));
    } catch (error) {
      console.error('Error fetching employee resource allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [user, projectId]);

  const createAllocation = async (allocationData: any) => {
    console.warn('⚠️ DEPRECATED: createAllocation should use stakeholder assignments directly');
    // This would need to create stakeholder assignments instead
    return { error: 'Use stakeholder assignments system instead' };
  };

  return {
    allocations,
    loading,
    createAllocation,
    refetch: fetchAllocations
  };
};
