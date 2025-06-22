
import { supabase } from '@/integrations/supabase/client';
import { StakeholderAssignment, CreateAssignmentData } from './types';
import { transformAssignmentData, enhanceAssignmentData } from './assignmentUtils';

export const fetchAssignments = async (projectId?: string) => {
  let query = supabase
    .from('stakeholder_assignments')
    .select(`
      *,
      stakeholder:stakeholders(*)
    `)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Transform the data to ensure proper typing for daily_hours
  const transformedData = (data || []).map(transformAssignmentData);
  
  return transformedData;
};

export const createAssignment = async (assignmentData: CreateAssignmentData) => {
  const enhancedData = enhanceAssignmentData(assignmentData);

  const { data, error } = await supabase
    .from('stakeholder_assignments')
    .insert([enhancedData])
    .select(`
      *,
      stakeholder:stakeholders(*)
    `)
    .single();

  if (error) throw error;

  // Transform the returned data
  const transformedData = transformAssignmentData(data);
  
  return transformedData;
};

export const updateAssignment = async (id: string, updates: Partial<StakeholderAssignment>) => {
  const { data, error } = await supabase
    .from('stakeholder_assignments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      stakeholder:stakeholders(*)
    `)
    .single();

  if (error) throw error;

  // Transform the returned data
  const transformedData = transformAssignmentData(data);
  
  return transformedData;
};

export const updateDailyHours = async (id: string, date: string, hours: number, currentAssignment: StakeholderAssignment) => {
  // Update daily hours
  const updatedDailyHours = {
    ...currentAssignment.daily_hours,
    [date]: hours
  };

  // Calculate new total hours
  const totalHours = Object.values(updatedDailyHours).reduce((sum, h) => sum + h, 0);

  const { data, error } = await supabase
    .from('stakeholder_assignments')
    .update({
      daily_hours: updatedDailyHours,
      total_hours: totalHours
    })
    .eq('id', id)
    .select(`
      *,
      stakeholder:stakeholders(*)
    `)
    .single();

  if (error) throw error;

  // Transform the returned data
  const transformedData = transformAssignmentData(data);
  
  return transformedData;
};
