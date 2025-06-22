
import { supabase } from '@/integrations/supabase/client';
import { UtilizationMetrics } from './types';

export const calculateEmployeeUtilization = async (stakeholderId: string): Promise<UtilizationMetrics> => {
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
};
