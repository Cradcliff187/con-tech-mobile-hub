import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export type InteractionType = 'call' | 'email' | 'meeting' | 'site_visit' | 'proposal' | 'follow_up';

export interface ContactInteraction {
  id: string;
  stakeholder_id: string;
  interaction_type: InteractionType;
  interaction_date: string;
  duration_minutes?: number;
  subject?: string;
  notes?: string;
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useContactInteractions = (stakeholderId?: string) => {
  const [interactions, setInteractions] = useState<ContactInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setInteractions([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('contact_interactions')
        .select('*')
        .order('interaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (stakeholderId) {
        query = query.eq('stakeholder_id', stakeholderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contact interactions:', error);
        setInteractions([]);
        return;
      }

      setInteractions(data || []);
    } catch (error) {
      console.error('Error in fetchInteractions:', error);
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, stakeholderId]);

  // Handle real-time updates
  const handleInteractionsUpdate = useCallback((payload: any) => {
    console.log('Contact interactions change detected:', payload);
    fetchInteractions();
  }, [fetchInteractions]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'contact_interactions',
    handleInteractionsUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchInteractions();
    } else {
      setInteractions([]);
      setLoading(false);
    }
  }, [user?.id, fetchInteractions]);

  const createInteraction = useCallback(async (
    interactionData: Omit<ContactInteraction, 'id' | 'created_at' | 'updated_at' | 'created_by'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('contact_interactions')
        .insert({
          ...interactionData,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update stakeholder's last contact date
      if (data) {
        // First check if stakeholder has a first_contact_date
        const { data: stakeholder } = await supabase
          .from('stakeholders')
          .select('first_contact_date')
          .eq('id', data.stakeholder_id)
          .single();

        await supabase
          .from('stakeholders')
          .update({
            last_contact_date: data.interaction_date,
            first_contact_date: stakeholder?.first_contact_date || data.interaction_date,
          })
          .eq('id', data.stakeholder_id);
      }

      toast({
        title: "Success",
        description: "Interaction logged successfully"
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating interaction:', error);
      toast({
        title: "Error",
        description: "Failed to log interaction",
        variant: "destructive"
      });
      return { data: null, error };
    }
  }, [user?.id, toast]);

  const updateInteraction = useCallback(async (
    id: string, 
    updates: Partial<ContactInteraction>
  ) => {
    try {
      const { data, error } = await supabase
        .from('contact_interactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interaction updated successfully"
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating interaction:', error);
      toast({
        title: "Error",
        description: "Failed to update interaction",
        variant: "destructive"
      });
      return { data: null, error };
    }
  }, [toast]);

  const deleteInteraction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interaction deleted successfully"
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting interaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete interaction",
        variant: "destructive"
      });
      return { error };
    }
  }, [toast]);

  const getUpcomingFollowUps = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contact_interactions')
        .select(`
          *,
          stakeholders!inner(
            id,
            company_name,
            contact_person,
            stakeholder_type
          )
        `)
        .eq('follow_up_required', true)
        .not('follow_up_date', 'is', null)
        .gte('follow_up_date', new Date().toISOString().split('T')[0])
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      return { data: null, error };
    }
  }, []);

  const markFollowUpComplete = useCallback(async (id: string) => {
    return await updateInteraction(id, {
      follow_up_required: false,
      follow_up_date: undefined
    });
  }, [updateInteraction]);

  const refetch = useCallback(async () => {
    await fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getUpcomingFollowUps,
    markFollowUpComplete,
    refetch
  };
};