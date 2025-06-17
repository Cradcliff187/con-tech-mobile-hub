
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Stakeholder } from './useStakeholders';

export interface StakeholderAssignment {
  id: string;
  stakeholder_id: string;
  project_id?: string;
  task_id?: string;
  equipment_id?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  stakeholder?: Stakeholder;
}

export const useStakeholderAssignments = () => {
  const [assignments, setAssignments] = useState<StakeholderAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssignments = async (projectId?: string) => {
    setLoading(true);
    try {
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
      setAssignments(data || []);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stakeholder assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: Omit<StakeholderAssignment, 'id' | 'created_at' | 'updated_at' | 'stakeholder'>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholder_assignments')
        .insert([assignmentData])
        .select(`
          *,
          stakeholder:stakeholders(*)
        `)
        .single();

      if (error) throw error;

      setAssignments(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Stakeholder assigned successfully"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign stakeholder",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateAssignment = async (id: string, updates: Partial<StakeholderAssignment>) => {
    try {
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

      setAssignments(prev => prev.map(a => a.id === id ? data : a));
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    refetch: fetchAssignments
  };
};
