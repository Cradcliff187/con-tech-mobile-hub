import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StakeholderAssignment } from './stakeholders/types';
import { Stakeholder } from './useStakeholders';
import { Project } from '@/types/database';

// Enhanced types for employee assignments
export interface EmployeeAssignment extends StakeholderAssignment {
  stakeholder: Stakeholder & { stakeholder_type: 'employee' };
  project?: Project;
  utilization_percentage?: number;
}

export interface UtilizationMetrics {
  total_hours: number;
  total_projects: number;
  weekly_capacity: number;
  utilization_rate: number;
  is_over_allocated: boolean;
}

export interface EmployeeCosts {
  project_id: string;
  project_name?: string;
  total_labor_cost: number;
  employee_count: number;
  avg_hourly_rate: number;
  total_hours: number;
}

export interface CreateEmployeeAssignmentData {
  stakeholder_id: string;
  project_id: string;
  role?: string;
  hourly_rate?: number;
  start_date?: string;
  end_date?: string;
  total_hours?: number;
  status?: string;
  notes?: string;
}

export const useEmployeeAssignments = () => {
  const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch employee assignments with project and stakeholder details
  const getEmployeeAssignments = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('stakeholder_assignments')
        .select(`
          *,
          stakeholder:stakeholders!inner(*),
          project:projects(*)
        `)
        .eq('stakeholder.stakeholder_type', 'employee')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Transform and enhance data
      const enhancedAssignments = await Promise.all(
        (data || []).map(async (assignment) => {
          const utilization = await calculateEmployeeUtilization(assignment.stakeholder_id);
          return {
            ...assignment,
            utilization_percentage: utilization.utilization_rate
          } as EmployeeAssignment;
        })
      );

      setEmployeeAssignments(enhancedAssignments);
      
    } catch (err: any) {
      console.error('Error fetching employee assignments:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch employee assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Calculate employee utilization across all projects
  const calculateEmployeeUtilization = useCallback(async (stakeholderId: string): Promise<UtilizationMetrics> => {
    try {
      const { data, error } = await supabase
        .from('stakeholder_assignments')
        .select('total_hours, weekly_hours:total_hours, project_id')
        .eq('stakeholder_id', stakeholderId)
        .eq('status', 'assigned');

      if (error) throw error;

      const totalHours = (data || []).reduce((sum, assignment) => sum + (assignment.total_hours || 0), 0);
      const totalProjects = new Set(data?.map(a => a.project_id)).size;
      const weeklyCapacity = 40; // Standard 40-hour work week
      const utilizationRate = weeklyCapacity > 0 ? (totalHours / weeklyCapacity) * 100 : 0;

      return {
        total_hours: totalHours,
        total_projects: totalProjects,
        weekly_capacity: weeklyCapacity,
        utilization_rate: Math.min(utilizationRate, 100),
        is_over_allocated: utilizationRate > 100
      };
    } catch (err) {
      console.error('Error calculating utilization:', err);
      return {
        total_hours: 0,
        total_projects: 0,
        weekly_capacity: 40,
        utilization_rate: 0,
        is_over_allocated: false
      };
    }
  }, []);

  // Assign employee to project
  const assignEmployee = useCallback(async (data: CreateEmployeeAssignmentData) => {
    try {
      // Validate employee stakeholder exists
      const { data: stakeholder, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('id', data.stakeholder_id)
        .eq('stakeholder_type', 'employee')
        .single();

      if (stakeholderError || !stakeholder) {
        throw new Error('Invalid employee stakeholder');
      }

      // Check for scheduling conflicts
      const utilization = await calculateEmployeeUtilization(data.stakeholder_id);
      if (utilization.is_over_allocated) {
        toast({
          title: "Warning",
          description: "Employee may be over-allocated",
          variant: "destructive"
        });
      }

      // Create assignment with enhanced data
      const assignmentData = {
        ...data,
        total_cost: (data.total_hours || 0) * (data.hourly_rate || 0),
        status: data.status || 'assigned',
        daily_hours: {},
        week_start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : null
      };

      const { data: newAssignment, error: createError } = await supabase
        .from('stakeholder_assignments')
        .insert([assignmentData])
        .select(`
          *,
          stakeholder:stakeholders(*),
          project:projects(*)
        `)
        .single();

      if (createError) throw createError;

      // Update local state
      const enhancedAssignment = {
        ...newAssignment,
        utilization_percentage: utilization.utilization_rate
      } as EmployeeAssignment;

      setEmployeeAssignments(prev => [enhancedAssignment, ...prev]);
      
      toast({
        title: "Success",
        description: "Employee assigned successfully"
      });

      return { data: enhancedAssignment, error: null };
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to assign employee",
        variant: "destructive"
      });
      return { data: null, error: err };
    }
  }, [calculateEmployeeUtilization, toast]);

  // Update employee hours (supports both total and daily hours)
  const updateEmployeeHours = useCallback(async (
    assignmentId: string, 
    hours: number | Record<string, number>,
    isDaily: boolean = false
  ) => {
    try {
      const assignment = employeeAssignments.find(a => a.id === assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      let updateData: any = {};

      if (isDaily && typeof hours === 'object') {
        // Update daily hours
        const updatedDailyHours = { ...assignment.daily_hours, ...hours };
        const totalHours = Object.values(updatedDailyHours).reduce((sum, h) => sum + (h as number), 0);
        
        updateData = {
          daily_hours: updatedDailyHours,
          total_hours: totalHours,
          total_cost: totalHours * (assignment.hourly_rate || 0)
        };
      } else if (typeof hours === 'number') {
        // Update total hours
        updateData = {
          total_hours: hours,
          total_cost: hours * (assignment.hourly_rate || 0)
        };
      }

      const { data: updatedAssignment, error: updateError } = await supabase
        .from('stakeholder_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select(`
          *,
          stakeholder:stakeholders(*),
          project:projects(*)
        `)
        .single();

      if (updateError) throw updateError;

      // Recalculate utilization
      const utilization = await calculateEmployeeUtilization(assignment.stakeholder_id);
      const enhancedAssignment = {
        ...updatedAssignment,
        utilization_percentage: utilization.utilization_rate
      } as EmployeeAssignment;

      // Update local state
      setEmployeeAssignments(prev => 
        prev.map(a => a.id === assignmentId ? enhancedAssignment : a)
      );

      toast({
        title: "Success",
        description: "Employee hours updated successfully"
      });

      return { data: enhancedAssignment, error: null };
    } catch (err: any) {
      console.error('Error updating employee hours:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to update employee hours",
        variant: "destructive"
      });
      return { data: null, error: err };
    }
  }, [employeeAssignments, calculateEmployeeUtilization, toast]);

  // Get employee costs for a project
  const getEmployeeCosts = useCallback(async (projectId: string): Promise<EmployeeCosts[]> => {
    try {
      const { data, error } = await supabase
        .from('project_labor_costs')
        .select('*')
        .eq('project_id', projectId)
        .eq('stakeholder_type', 'employee');

      if (error) throw error;

      return (data || []).map(cost => ({
        project_id: cost.project_id,
        project_name: cost.project_name,
        total_labor_cost: cost.total_cost,
        employee_count: cost.assignment_count,
        avg_hourly_rate: cost.avg_hourly_rate,
        total_hours: cost.total_hours
      }));
    } catch (err: any) {
      console.error('Error fetching employee costs:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Calculate aggregated utilization metrics for all employees
  const utilizationSummary = useMemo(() => {
    const employees = new Set(employeeAssignments.map(a => a.stakeholder_id));
    const totalEmployees = employees.size;
    const overAllocatedCount = employeeAssignments.filter(a => 
      (a.utilization_percentage || 0) > 100
    ).length;

    return {
      total_employees: totalEmployees,
      over_allocated_count: overAllocatedCount,
      avg_utilization: employeeAssignments.length > 0 
        ? employeeAssignments.reduce((sum, a) => sum + (a.utilization_percentage || 0), 0) / employeeAssignments.length
        : 0
    };
  }, [employeeAssignments]);

  // Initialize data on mount
  useEffect(() => {
    getEmployeeAssignments();
  }, [getEmployeeAssignments]);

  return {
    // Data
    employeeAssignments,
    loading,
    error,
    utilizationSummary,

    // Functions
    getEmployeeAssignments,
    assignEmployee,
    updateEmployeeHours,
    getEmployeeCosts,
    calculateEmployeeUtilization,

    // Utilities
    refetch: getEmployeeAssignments
  };
};
