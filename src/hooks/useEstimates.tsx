import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export interface Estimate {
  id: string;
  estimate_number: string;
  stakeholder_id: string;
  project_id?: string;
  title: string;
  description?: string;
  amount: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  markup_percentage?: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  sent_date?: string;
  viewed_date?: string;
  responded_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  stakeholder?: {
    contact_person: string;
    company_name?: string;
    email?: string;
  };
}

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEstimates = useCallback(async () => {
    if (!user) {
      setEstimates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          stakeholder:stakeholders (
            contact_person,
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching estimates:', error);
        setEstimates([]);
        return;
      }

      setEstimates(data || []);
    } catch (error) {
      console.error('Error in fetchEstimates:', error);
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time updates using centralized subscription manager
  const handleEstimatesUpdate = useCallback((payload: any) => {
    console.log('Estimates change detected:', payload);
    fetchEstimates();
  }, [fetchEstimates]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'estimates',
    handleEstimatesUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchEstimates();
    } else {
      setEstimates([]);
      setLoading(false);
    }
  }, [user?.id, fetchEstimates]);

  const createEstimate = useCallback(async (estimateData: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'estimate_number'>) => {
    try {
      // Generate estimate number using database function
      const { data: estimateNumber, error: numberError } = await supabase
        .rpc('generate_estimate_number');

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('estimates')
        .insert({
          ...estimateData,
          estimate_number: estimateNumber,
          created_by: user?.id
        })
        .select(`
          *,
          stakeholder:stakeholders (
            contact_person,
            company_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating estimate:', error);
      return { data: null, error };
    }
  }, [user?.id]);

  const updateEstimate = useCallback(async (id: string, updates: Partial<Estimate>) => {
    try {
      // Convert undefined values to null explicitly for Supabase
      const processedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('estimates')
        .update(processedUpdates)
        .eq('id', id)
        .select(`
          *,
          stakeholder:stakeholders (
            contact_person,
            company_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating estimate:', error);
      return { data: null, error };
    }
  }, []);

  const deleteEstimate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Estimate deleted successfully"
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast({
        title: "Error",
        description: "Failed to delete estimate.",
        variant: "destructive"
      });
      return { error };
    }
  }, [toast]);

  const updateEstimateStatus = useCallback(async (id: string, status: Estimate['status']) => {
    const updateData: Partial<Estimate> = { status };
    
    // Update date fields based on status change
    const now = new Date().toISOString().split('T')[0];
    switch (status) {
      case 'sent':
        updateData.sent_date = now;
        break;
      case 'viewed':
        updateData.viewed_date = now;
        break;
      case 'accepted':
      case 'declined':
        updateData.responded_date = now;
        break;
    }

    return updateEstimate(id, updateData);
  }, [updateEstimate]);

  const refetch = useCallback(async () => {
    await fetchEstimates();
  }, [fetchEstimates]);

  return { 
    estimates, 
    loading, 
    createEstimate, 
    updateEstimate, 
    deleteEstimate,
    updateEstimateStatus,
    refetch
  };
};