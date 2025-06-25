
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  // Real-time subscription setup
  useEffect(() => {
    if (!user) return;

    console.log('Setting up stakeholders real-time subscription', { projectId });

    const handleStakeholderChange = async () => {
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
          } else {
            // No assignments found, return empty array
            setStakeholders([]);
            setLoading(false);
            return;
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching stakeholders:', error);
          setStakeholders([]);
        } else {
          setStakeholders(data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in stakeholders subscription handler:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    handleStakeholderChange();

    // Set up real-time subscription
    const channel = supabase
      .channel('stakeholders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stakeholders' },
        () => handleStakeholderChange()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stakeholder_assignments' },
        () => handleStakeholderChange()
      )
      .subscribe();

    return () => {
      console.log('Cleaning up stakeholders subscription');
      supabase.removeChannel(channel);
    };
  }, [user, projectId]);

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

      // Real-time subscription will handle state update
      return { data, error: null };
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      return { data: null, error };
    }
  }, []);

  const updateStakeholder = useCallback(async (id: string, updates: Partial<Stakeholder>) => {
    try {
      console.log('=== DEBUG: updateStakeholder called ===');
      console.log('Stakeholder ID:', id);
      console.log('Updates being sent:', JSON.stringify(updates, null, 2));
      
      // Convert undefined values to null explicitly for Supabase
      const processedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {} as Record<string, any>);
      
      console.log('=== DEBUG: Processed updates (undefined -> null) ===');
      console.log('Processed updates:', JSON.stringify(processedUpdates, null, 2));

      const { data, error } = await supabase
        .from('stakeholders')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('=== DEBUG: Supabase update error ===', error);
        throw error;
      }

      console.log('=== DEBUG: Supabase update successful ===');
      console.log('Returned data:', JSON.stringify(data, null, 2));
      
      // Real-time subscription will handle state update
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

      // Real-time subscription will handle state update
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

  // Manual refetch function for compatibility
  const refetch = useCallback(async () => {
    // Real-time subscription handles automatic updates, but this is kept for compatibility
    console.log('Manual refetch called - real-time subscription should handle updates automatically');
  }, []);

  return { 
    stakeholders, 
    loading, 
    createStakeholder, 
    updateStakeholder, 
    deleteStakeholder,
    refetch
  };
};
