
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';

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
  // Lead tracking fields
  lead_source?: string;
  lead_status?: LeadStatus;
  lead_score?: number;
  first_contact_date?: string;
  last_contact_date?: string;
  next_followup_date?: string;
  conversion_probability?: number;
  customer_lifetime_value?: number;
}

export const useStakeholders = (projectId?: string) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchStakeholders = useCallback(async () => {
    if (!user) {
      setStakeholders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stakeholders:', error);
        setStakeholders([]);
        return;
      }

      setStakeholders(data || []);
    } catch (error) {
      console.error('Error in fetchStakeholders:', error);
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time updates using centralized subscription manager with enhanced debugging
  const handleStakeholdersUpdate = useCallback((payload: any) => {
    console.log('=== STAKEHOLDER REAL-TIME UPDATE ===');
    console.log('Event type:', payload.eventType);
    console.log('Table:', payload.table);
    console.log('Old record:', payload.old);
    console.log('New record:', payload.new);
    console.log('Timestamp:', new Date().toISOString());
    
    // Handle different event types optimistically
    if (payload.eventType === 'UPDATE' && payload.new) {
      console.log('Processing UPDATE event with optimistic update');
      setStakeholders(current => {
        const updatedStakeholders = current.map(stakeholder => 
          stakeholder.id === payload.new.id ? { ...stakeholder, ...payload.new } : stakeholder
        );
        console.log('Optimistically updated stakeholders list');
        return updatedStakeholders;
      });
    } else if (payload.eventType === 'INSERT' && payload.new) {
      console.log('Processing INSERT event with optimistic update');
      setStakeholders(current => {
        const exists = current.some(s => s.id === payload.new.id);
        if (!exists) {
          return [payload.new, ...current];
        }
        return current;
      });
    } else if (payload.eventType === 'DELETE' && payload.old) {
      console.log('Processing DELETE event with optimistic update');
      setStakeholders(current => current.filter(s => s.id !== payload.old.id));
    } else {
      console.log('Fallback: Fetching all stakeholders');
      fetchStakeholders();
    }
  }, [fetchStakeholders]);

  // Use centralized subscription management with enhanced monitoring
  const { isSubscribed, isConnecting, error, retryCount, getSubscriptionInfo } = useSubscription(
    'stakeholders',
    handleStakeholdersUpdate,
    {
      userId: user?.id,
      enabled: !!user,
      event: '*' // Listen to all events (INSERT, UPDATE, DELETE)
    }
  );

  // Debug subscription status changes
  useEffect(() => {
    console.log('=== STAKEHOLDER SUBSCRIPTION STATUS ===');
    console.log('Is subscribed:', isSubscribed);
    console.log('Is connecting:', isConnecting);
    console.log('Error:', error);
    console.log('Retry count:', retryCount);
    
    if (getSubscriptionInfo) {
      const subInfo = getSubscriptionInfo();
      console.log('Subscription info:', subInfo);
    }
  }, [isSubscribed, isConnecting, error, retryCount, getSubscriptionInfo]);

  // Initial fetch when user changes
  useEffect(() => {
    console.log('=== INITIAL FETCH EFFECT ===');
    console.log('User:', user?.id);
    if (user) {
      console.log('Fetching stakeholders for user:', user.id);
      fetchStakeholders();
    } else {
      console.log('No user, clearing stakeholders');
      setStakeholders([]);
      setLoading(false);
    }
  }, [user?.id, fetchStakeholders]);

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

  const updateLeadStatus = useCallback(async (id: string, leadStatus: LeadStatus, notes?: string) => {
    const updates: Partial<Stakeholder> = {
      lead_status: leadStatus,
      last_contact_date: new Date().toISOString().split('T')[0]
    };

    if (notes) {
      updates.notes = notes;
    }

    // Set first contact date if this is the first contact
    if (leadStatus === 'contacted') {
      const stakeholder = stakeholders.find(s => s.id === id);
      if (stakeholder && !stakeholder.first_contact_date) {
        updates.first_contact_date = new Date().toISOString().split('T')[0];
      }
    }

    return await updateStakeholder(id, updates);
  }, [updateStakeholder, stakeholders]);

  const scheduleFollowUp = useCallback(async (id: string, followUpDate: string, notes?: string) => {
    const updates: Partial<Stakeholder> = {
      next_followup_date: followUpDate
    };

    if (notes) {
      updates.notes = notes;
    }

    return await updateStakeholder(id, updates);
  }, [updateStakeholder]);

  const refetch = useCallback(async () => {
    await fetchStakeholders();
  }, [fetchStakeholders]);

  return { 
    stakeholders, 
    loading, 
    createStakeholder, 
    updateStakeholder, 
    updateLeadStatus,
    scheduleFollowUp,
    deleteStakeholder,
    refetch
  };
};
