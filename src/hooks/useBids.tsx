import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export interface Bid {
  id: string;
  bid_number: string;
  estimate_id?: string;
  project_id?: string;
  bid_amount: number;
  status: 'pending' | 'submitted' | 'accepted' | 'declined' | 'withdrawn';
  submission_date?: string;
  decision_date?: string;
  win_probability?: number;
  competitor_count?: number;
  estimated_competition_range_low?: number;
  estimated_competition_range_high?: number;
  win_loss_reason?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  estimate?: {
    estimate_number: string;
    title: string;
    stakeholder_id: string;
  };
  project?: {
    name: string;
    status: string;
  };
  stakeholder?: {
    contact_person: string;
    company_name?: string;
    email?: string;
  };
}

export const useBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBids = useCallback(async () => {
    if (!user) {
      setBids([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          estimate:estimates (
            estimate_number,
            title,
            stakeholder_id
          ),
          project:projects (
            name,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bids:', error);
        setBids([]);
        return;
      }

      // Join stakeholder data from estimates
      const bidsWithStakeholders = await Promise.all(
        (data || []).map(async (bid) => {
          if (bid.estimate?.stakeholder_id) {
            const { data: stakeholder } = await supabase
              .from('stakeholders')
              .select('contact_person, company_name, email')
              .eq('id', bid.estimate.stakeholder_id)
              .single();
            
            return {
              ...bid,
              stakeholder
            };
          }
          return bid;
        })
      );

      setBids(bidsWithStakeholders);
    } catch (error) {
      console.error('Error in fetchBids:', error);
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time updates using centralized subscription manager
  const handleBidsUpdate = useCallback((payload: any) => {
    console.log('Bids change detected:', payload);
    fetchBids();
  }, [fetchBids]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'bids',
    handleBidsUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchBids();
    } else {
      setBids([]);
      setLoading(false);
    }
  }, [user?.id, fetchBids]);

  const createBid = useCallback(async (bidData: Omit<Bid, 'id' | 'created_at' | 'updated_at' | 'bid_number'>) => {
    try {
      // Generate bid number using database function
      const { data: bidNumber, error: numberError } = await supabase
        .rpc('generate_bid_number');

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('bids')
        .insert({
          ...bidData,
          bid_number: bidNumber,
          created_by: user?.id
        })
        .select(`
          *,
          estimate:estimates (
            estimate_number,
            title,
            stakeholder_id
          ),
          project:projects (
            name,
            status
          )
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating bid:', error);
      return { data: null, error };
    }
  }, [user?.id]);

  const updateBid = useCallback(async (id: string, updates: Partial<Bid>) => {
    try {
      // Convert undefined values to null explicitly for Supabase
      const processedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('bids')
        .update(processedUpdates)
        .eq('id', id)
        .select(`
          *,
          estimate:estimates (
            estimate_number,
            title,
            stakeholder_id
          ),
          project:projects (
            name,
            status
          )
        `)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating bid:', error);
      return { data: null, error };
    }
  }, []);

  const deleteBid = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bid deleted successfully"
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting bid:', error);
      toast({
        title: "Error",
        description: "Failed to delete bid.",
        variant: "destructive"
      });
      return { error };
    }
  }, [toast]);

  const updateBidStatus = useCallback(async (id: string, status: Bid['status'], reason?: string) => {
    const updateData: Partial<Bid> = { status };
    
    // Update date fields based on status change
    const now = new Date().toISOString().split('T')[0];
    switch (status) {
      case 'submitted':
        updateData.submission_date = now;
        break;
      case 'accepted':
      case 'declined':
        updateData.decision_date = now;
        if (reason) {
          updateData.win_loss_reason = reason;
        }
        break;
    }

    return updateBid(id, updateData);
  }, [updateBid]);

  const convertBidToProject = useCallback(async (bidId: string, projectName?: string) => {
    try {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) {
        throw new Error('Bid not found');
      }

      // Use the existing convert_estimate_to_project function if bid has estimate
      if (bid.estimate_id) {
        const { data: projectId, error } = await supabase
          .rpc('convert_estimate_to_project', {
            p_estimate_id: bid.estimate_id,
            p_project_name: projectName
          });

        if (error) throw error;

        // Update bid to link to new project
        await updateBid(bidId, { 
          project_id: projectId,
          status: 'accepted'
        });

        return { data: projectId, error: null };
      } else {
        throw new Error('Cannot convert bid without associated estimate');
      }
    } catch (error) {
      console.error('Error converting bid to project:', error);
      return { data: null, error };
    }
  }, [bids, updateBid]);

  const refetch = useCallback(async () => {
    await fetchBids();
  }, [fetchBids]);

  return { 
    bids, 
    loading, 
    createBid, 
    updateBid, 
    deleteBid,
    updateBidStatus,
    convertBidToProject,
    refetch
  };
};