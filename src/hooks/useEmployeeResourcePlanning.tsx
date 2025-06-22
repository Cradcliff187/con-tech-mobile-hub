
import { useState, useEffect, useMemo } from 'react';
import { useEmployeeAssignments } from './employee-assignments';
import { useProjects } from './useProjects';

interface EmployeeResourceGroup {
  id: string;
  team_name: string;
  week_start_date: string;
  project_id?: string;
  project_name?: string;
  total_budget: number;
  total_used: number;
  total_allocated_hours: number;
  total_actual_cost: number;
  members: EmployeeResourceMember[];
}

interface EmployeeResourceMember {
  id: string;
  name: string;
  role: string;
  hours_allocated: number;
  hours_used: number;
  cost_per_hour: number;
  hourly_rate: number;
  total_cost: number;
  availability: number;
  utilization_percentage?: number;
  tasks?: string[];
  user_id?: string;
}

export const useEmployeeResourcePlanning = (projectId?: string) => {
  const { employeeAssignments, loading } = useEmployeeAssignments();
  const { projects } = useProjects();
  const [resourceGroups, setResourceGroups] = useState<EmployeeResourceGroup[]>([]);

  console.info('✅ Employee Resource Planning: Using consolidated stakeholder_assignments system');

  // Filter assignments for employees only and by project if specified
  const filteredAssignments = useMemo(() => {
    return employeeAssignments.filter(assignment => {
      const isEmployee = assignment.stakeholder?.stakeholder_type === 'employee';
      const matchesProject = !projectId || assignment.project_id === projectId;
      return isEmployee && matchesProject;
    });
  }, [employeeAssignments, projectId]);

  // Group assignments by week_start_date and project
  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, EmployeeResourceGroup>();

    filteredAssignments.forEach(assignment => {
      const project = projects.find(p => p.id === assignment.project_id);
      const weekKey = `${assignment.week_start_date || 'current-week'}-${assignment.project_id || 'no-project'}`;
      
      if (!groups.has(weekKey)) {
        // Calculate estimated budget based on total hours and average rates
        const estimatedBudget = (assignment.total_hours || 0) * (assignment.hourly_rate || 0) * 1.2; // Add 20% buffer
        
        groups.set(weekKey, {
          id: weekKey,
          team_name: `${project?.name || 'Unknown Project'} Team`,
          week_start_date: assignment.week_start_date || new Date().toISOString().split('T')[0],
          project_id: assignment.project_id,
          project_name: project?.name,
          total_budget: estimatedBudget,
          total_used: 0,
          total_allocated_hours: 0,
          total_actual_cost: 0,
          members: []
        });
      }

      const group = groups.get(weekKey)!;
      
      // Convert assignment to member format with accurate cost calculations
      const member: EmployeeResourceMember = {
        id: assignment.id,
        name: assignment.stakeholder?.contact_person || 'Unknown Employee',
        role: assignment.role || 'Employee',
        hours_allocated: assignment.total_hours || 0,
        hours_used: Math.floor((assignment.total_hours || 0) * 0.7), // Simulate 70% completion
        cost_per_hour: assignment.hourly_rate || 0,
        hourly_rate: assignment.hourly_rate || 0,
        total_cost: assignment.total_cost || 0, // Now using accurate cost from database
        availability: assignment.utilization_percentage || 85, // Use utilization or default
        utilization_percentage: assignment.utilization_percentage,
        tasks: [], // Could be enhanced to show related tasks
        user_id: assignment.stakeholder?.profile_id
      };

      // Validate cost calculation accuracy
      const calculatedCost = member.hours_allocated * member.hourly_rate;
      if (Math.abs(member.total_cost - calculatedCost) > 0.01) {
        console.warn(`Cost discrepancy detected for ${member.name}: stored=${member.total_cost}, calculated=${calculatedCost}`);
      }

      group.members.push(member);
      group.total_allocated_hours += member.hours_allocated;
      group.total_actual_cost += member.total_cost;
      group.total_used = group.total_actual_cost; // Actual cost becomes "used" amount
    });

    return Array.from(groups.values());
  }, [filteredAssignments, projects]);

  // Calculate summary statistics with enhanced accuracy
  const summaryStats = useMemo(() => {
    const totalMembers = groupedAssignments.reduce((sum, group) => sum + group.members.length, 0);
    const totalHours = groupedAssignments.reduce((sum, group) => sum + group.total_allocated_hours, 0);
    const totalCost = groupedAssignments.reduce((sum, group) => sum + group.total_actual_cost, 0);
    const totalBudget = groupedAssignments.reduce((sum, group) => sum + group.total_budget, 0);
    
    // Calculate average utilization more accurately
    const avgUtilization = totalMembers > 0 ? (totalHours / (totalMembers * 40)) * 100 : 0;
    
    const budgetVariance = totalBudget - totalCost;
    const budgetVariancePercentage = totalBudget > 0 ? ((budgetVariance / totalBudget) * 100) : 0;
    
    // Count overallocated employees (>40 hours per week)
    const overallocatedCount = groupedAssignments.reduce((count, group) => 
      count + group.members.filter(m => m.hours_allocated > 40).length, 0
    );

    // Calculate cost accuracy metrics
    const totalMembersWithCostData = groupedAssignments.reduce((count, group) => 
      count + group.members.filter(m => m.total_cost > 0).length, 0
    );

    return {
      totalMembers,
      totalHours,
      totalCost,
      totalBudget,
      totalBudgetUsed: totalCost,
      avgUtilization: Math.round(avgUtilization * 100) / 100, // Round to 2 decimal places
      totalProjects: new Set(groupedAssignments.map(g => g.project_id)).size,
      budgetVariance,
      budgetVariancePercentage: Math.round(budgetVariancePercentage * 100) / 100,
      overallocatedCount,
      costAccuracyMetrics: {
        membersWithCostData: totalMembersWithCostData,
        averageHourlyRate: totalMembers > 0 ? totalCost / totalHours : 0
      }
    };
  }, [groupedAssignments]);

  useEffect(() => {
    setResourceGroups(groupedAssignments);
  }, [groupedAssignments]);

  return {
    resourceGroups,
    allocations: groupedAssignments, // Keep backward compatibility
    loading,
    summaryStats,
    refetch: () => {
      console.log('Refetching employee resource planning data...');
    }
  };
};
