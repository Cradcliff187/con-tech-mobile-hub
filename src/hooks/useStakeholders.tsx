
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Stakeholder {
  id: string;
  stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
  contact_person: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  specialties?: string[];
  crew_size?: number;
  license_number?: string;
  insurance_expiry?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  profile_id?: string;
  created_at: string;
  updated_at: string;
}

export const useStakeholders = (projectId?: string) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStakeholders = useCallback(async () => {
    console.log('Fetching stakeholders, projectId:', projectId);
    try {
      let query = supabase
        .from('stakeholders')
        .select('*')
        .eq('status', 'active')
        .order('contact_person');

      if (projectId) {
        // Get stakeholders assigned to this project
        const { data: assignments } = await supabase
          .from('stakeholder_assignments')
          .select('stakeholder_id')
          .eq('project_id', projectId);
        
        const stakeholderIds = assignments?.map(a => a.stakeholder_id) || [];
        if (stakeholderIds.length > 0) {
          query = query.in('id', stakeholderIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setStakeholders(data || []);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createStakeholder = useCallback(async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at' | 'rating'>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert({
          ...stakeholderData,
          rating: 0
        })
        .select()
        .single();

      if (error) throw error;

      setStakeholders(prev => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      return { data: null, error };
    }
  }, []);

  const updateStakeholder = useCallback(async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStakeholders(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      return { data: null, error };
    }
  }, []);

  const deleteStakeholder = useCallback(async (id: string) => {
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
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to delete stakeholder. They may have active assignments.",
        variant: "destructive"
      });
      return { error };
    }
  }, [toast]);

  useEffect(() => {
    fetchStakeholders();
  }, [fetchStakeholders]);

  return { 
    stakeholders, 
    loading, 
    createStakeholder, 
    updateStakeholder, 
    deleteStakeholder,
    refetch: fetchStakeholders
  };
};
