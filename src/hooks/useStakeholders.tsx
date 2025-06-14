
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Stakeholder {
  id: string;
  profile_id?: string;
  stakeholder_type: 'subcontractor' | 'employee' | 'vendor';
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialties?: string[];
  crew_size?: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  insurance_expiry?: string;
  license_number?: string;
  notes?: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

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

export const useStakeholders = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStakeholders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      setStakeholders(data || []);
    } catch (error: any) {
      console.error('Error fetching stakeholders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stakeholders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStakeholder = async (stakeholderData: Partial<Stakeholder>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([stakeholderData])
        .select()
        .single();

      if (error) throw error;

      setStakeholders(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Stakeholder created successfully"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to create stakeholder",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStakeholders(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Success",
        description: "Stakeholder updated successfully"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to update stakeholder",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteStakeholder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStakeholders(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Stakeholder deleted successfully"
      });
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to delete stakeholder",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchStakeholders();
  }, []);

  return {
    stakeholders,
    loading,
    createStakeholder,
    updateStakeholder,
    deleteStakeholder,
    refetch: fetchStakeholders
  };
};

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

  const createAssignment = async (assignmentData: Partial<StakeholderAssignment>) => {
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
