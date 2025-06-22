
import { supabase } from '@/integrations/supabase/client';
import { CreateEmployeeAssignmentData, EmployeeAssignment, EmployeeCosts } from './types';
import { calculateEmployeeUtilization } from './utilization';

export const fetchEmployeeAssignments = async (projectId?: string) => {
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

  const { data, error } = await query;
  if (error) throw error;

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

  return enhancedAssignments;
};

export const createEmployeeAssignment = async (data: CreateEmployeeAssignmentData) => {
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

  return newAssignment;
};

export const updateEmployeeAssignmentHours = async (
  assignmentId: string,
  assignment: EmployeeAssignment,
  hours: number | Record<string, number>,
  isDaily: boolean = false
) => {
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

  return updatedAssignment;
};

export const fetchEmployeeCosts = async (projectId: string): Promise<EmployeeCosts[]> => {
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
};
