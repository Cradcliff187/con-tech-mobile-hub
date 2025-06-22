
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeAssignment, CreateEmployeeAssignmentData } from './types';
import { 
  fetchEmployeeAssignments, 
  createEmployeeAssignment, 
  updateEmployeeAssignmentHours,
  fetchEmployeeCosts 
} from './operations';
import { calculateEmployeeUtilization } from './utilization';

export const useEmployeeAssignments = () => {
  const [employeeAssignments, setEmployeeAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getEmployeeAssignments = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchEmployeeAssignments(projectId);
      setEmployeeAssignments(data);
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

  const assignEmployee = useCallback(async (data: CreateEmployeeAssignmentData) => {
    try {
      // Check for scheduling conflicts
      const utilization = await calculateEmployeeUtilization(data.stakeholder_id);
      if (utilization.is_over_allocated) {
        toast({
          title: "Warning",
          description: "Employee may be over-allocated",
          variant: "destructive"
        });
      }

      const newAssignment = await createEmployeeAssignment(data);

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
  }, [toast]);

  const updateEmployeeHours = useCallback(async (
    assignmentId: string, 
    hours: number | Record<string, number>,
    isDaily: boolean = false
  ) => {
    try {
      const assignment = employeeAssignments.find(a => a.id === assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      const updatedAssignment = await updateEmployeeAssignmentHours(
        assignmentId, 
        assignment, 
        hours, 
        isDaily
      );

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
  }, [employeeAssignments, toast]);

  const getEmployeeCosts = useCallback(async (projectId: string) => {
    try {
      return await fetchEmployeeCosts(projectId);
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
