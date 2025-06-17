
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Stakeholder {
  id: string;
  profile_id?: string;
  stakeholder_type: 'subcontractor' | 'employee' | 'vendor' | 'client';
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  // New structured address fields
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  specialties?: string[];
  crew_size?: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  insurance_expiry?: string;
  license_number?: string;
  notes?: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
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

  const createStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at' | 'rating'> & { rating?: number }) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([{
          ...stakeholderData,
          rating: stakeholderData.rating || 0
        }])
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
