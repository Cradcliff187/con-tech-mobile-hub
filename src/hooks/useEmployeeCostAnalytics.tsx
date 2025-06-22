
import { useState, useEffect, useMemo } from 'react';
import { useProjectLaborCosts } from '@/hooks/useProjectLaborCosts';
import { useEmployeeAssignments } from '@/hooks/employee-assignments';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';

interface EmployeeCostSummary {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  totalEarnings: number;
  projectCount: number;
  utilizationRate: number;
  avgHourlyRate: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    earnings: number;
    role: string;
  }[];
}

interface ProjectCostSummary {
  projectId: string;
  projectName: string;
  budget: number;
  spent: number;
  variance: number;
  variancePercentage: number;
  employeeCount: number;
  totalHours: number;
  burnRate: number;
  employees: {
    employeeId: string;
    employeeName: string;
    hours: number;
    cost: number;
    role: string;
  }[];
}

export const useEmployeeCostAnalytics = (
  startDate?: string,
  endDate?: string,
  projectId?: string
) => {
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { employeeAssignments, loading: assignmentsLoading } = useEmployeeAssignments();
  const { laborCosts, loading: costsLoading } = useProjectLaborCosts(projectId);
  const [loading, setLoading] = useState(true);

  // Filter assignments by date range if provided
  const filteredAssignments = useMemo(() => {
    if (!startDate || !endDate) return employeeAssignments;
    
    return employeeAssignments.filter(assignment => {
      if (!assignment.start_date && !assignment.end_date) return true;
      
      const assignmentStart = assignment.start_date ? new Date(assignment.start_date) : null;
      const assignmentEnd = assignment.end_date ? new Date(assignment.end_date) : null;
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      // Check if assignment overlaps with date range
      if (assignmentStart && assignmentEnd) {
        return assignmentStart <= filterEnd && assignmentEnd >= filterStart;
      } else if (assignmentStart) {
        return assignmentStart <= filterEnd;
      } else if (assignmentEnd) {
        return assignmentEnd >= filterStart;
      }
      
      return true;
    });
  }, [employeeAssignments, startDate, endDate]);

  // Calculate employee cost summaries
  const employeeCostSummaries = useMemo(() => {
    const summaries: EmployeeCostSummary[] = [];
    
    const employeeMap = new Map<string, EmployeeCostSummary>();
    
    filteredAssignments.forEach(assignment => {
      if (!assignment.stakeholder?.id) return;
      
      const employeeId = assignment.stakeholder.id;
      const employeeName = assignment.stakeholder.contact_person || assignment.stakeholder.company_name || 'Unknown';
      const hours = assignment.total_hours || 0;
      const earnings = assignment.total_cost || 0;
      const hourlyRate = assignment.hourly_rate || 0;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employeeId,
          employeeName,
          totalHours: 0,
          totalEarnings: 0,
          projectCount: 0,
          utilizationRate: assignment.utilization_percentage || 0,
          avgHourlyRate: 0,
          projects: []
        });
      }
      
      const employee = employeeMap.get(employeeId)!;
      employee.totalHours += hours;
      employee.totalEarnings += earnings;
      employee.projectCount = new Set([...employee.projects.map(p => p.projectId), assignment.project_id]).size;
      
      // Add project details
      const project = projects.find(p => p.id === assignment.project_id);
      if (project) {
        employee.projects.push({
          projectId: assignment.project_id,
          projectName: project.name,
          hours,
          earnings,
          role: assignment.role || 'Worker'
        });
      }
    });
    
    // Calculate average hourly rates
    employeeMap.forEach(employee => {
      employee.avgHourlyRate = employee.totalHours > 0 
        ? employee.totalEarnings / employee.totalHours 
        : 0;
    });
    
    return Array.from(employeeMap.values());
  }, [filteredAssignments, projects]);

  // Calculate project cost summaries
  const projectCostSummaries = useMemo(() => {
    const summaries: ProjectCostSummary[] = [];
    
    projects.forEach(project => {
      const projectAssignments = filteredAssignments.filter(a => a.project_id === project.id);
      const totalSpent = projectAssignments.reduce((sum, a) => sum + (a.total_cost || 0), 0);
      const totalHours = projectAssignments.reduce((sum, a) => sum + (a.total_hours || 0), 0);
      const budget = project.budget || 0;
      const variance = budget - totalSpent;
      const variancePercentage = budget > 0 ? (variance / budget) * 100 : 0;
      
      // Calculate burn rate (spending per day over date range)
      let burnRate = 0;
      if (startDate && endDate && totalSpent > 0) {
        const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
        burnRate = totalSpent / days;
      }
      
      const employees = projectAssignments.map(assignment => ({
        employeeId: assignment.stakeholder?.id || '',
        employeeName: assignment.stakeholder?.contact_person || assignment.stakeholder?.company_name || 'Unknown',
        hours: assignment.total_hours || 0,
        cost: assignment.total_cost || 0,
        role: assignment.role || 'Worker'
      }));
      
      summaries.push({
        projectId: project.id,
        projectName: project.name,
        budget,
        spent: totalSpent,
        variance,
        variancePercentage,
        employeeCount: new Set(employees.map(e => e.employeeId)).size,
        totalHours,
        burnRate,
        employees
      });
    });
    
    return summaries;
  }, [projects, filteredAssignments, startDate, endDate]);

  // Overall analytics
  const overallAnalytics = useMemo(() => {
    const totalBudget = projectCostSummaries.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projectCostSummaries.reduce((sum, p) => sum + p.spent, 0);
    const totalHours = employeeCostSummaries.reduce((sum, e) => sum + e.totalHours, 0);
    const avgUtilization = employeeCostSummaries.length > 0 
      ? employeeCostSummaries.reduce((sum, e) => sum + e.utilizationRate, 0) / employeeCostSummaries.length
      : 0;
    
    return {
      totalBudget,
      totalSpent,
      totalVariance: totalBudget - totalSpent,
      totalVariancePercentage: totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0,
      totalHours,
      avgUtilization,
      totalEmployees: employeeCostSummaries.length,
      totalProjects: projectCostSummaries.length
    };
  }, [projectCostSummaries, employeeCostSummaries]);

  useEffect(() => {
    setLoading(assignmentsLoading || costsLoading);
  }, [assignmentsLoading, costsLoading]);

  return {
    employeeCostSummaries,
    projectCostSummaries,
    overallAnalytics,
    loading
  };
};
