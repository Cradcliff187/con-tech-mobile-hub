import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export interface CRMMetrics {
  pipelineValue: number;
  conversionRate: number;
  activeLeads: number;
  upcomingFollowUps: number;
  monthlyRevenue: number;
  pipelineStats: {
    leads: { count: number; value: number };
    estimates: { count: number; value: number };
    bids: { count: number; value: number };
    projects: { count: number; value: number };
  };
  recentActivity: Array<{
    id: string;
    type: 'interaction' | 'estimate' | 'bid' | 'project';
    title: string;
    description: string;
    date: string;
    stakeholder?: string;
  }>;
}

export const useCRMMetrics = () => {
  const [metrics, setMetrics] = useState<CRMMetrics>({
    pipelineValue: 0,
    conversionRate: 0,
    activeLeads: 0,
    upcomingFollowUps: 0,
    monthlyRevenue: 0,
    pipelineStats: {
      leads: { count: 0, value: 0 },
      estimates: { count: 0, value: 0 },
      bids: { count: 0, value: 0 },
      projects: { count: 0, value: 0 }
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCRMMetrics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch pipeline stats
      const [
        { data: leadsData },
        { data: estimatesData },
        { data: bidsData },
        { data: projectsData },
        { data: followUpsData },
        { data: recentInteractions },
        { data: recentEstimates },
        { data: recentBids }
      ] = await Promise.all([
        // Active leads
        supabase
          .from('stakeholders')
          .select('id, lead_status')
          .eq('stakeholder_type', 'client')
          .in('lead_status', ['new', 'contacted', 'qualified']),
        
        // Active estimates
        supabase
          .from('estimates')
          .select('id, amount, status')
          .in('status', ['draft', 'sent', 'viewed']),
        
        // Active bids
        supabase
          .from('bids')
          .select('id, bid_amount, status')
          .in('status', ['pending', 'submitted']),
        
        // Recent projects (this month)
        supabase
          .from('projects')
          .select('id, budget, created_at')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        // Upcoming follow-ups
        supabase
          .from('contact_interactions')
          .select('id')
          .eq('follow_up_required', true)
          .gte('follow_up_date', new Date().toISOString().split('T')[0]),
        
        // Recent interactions
        supabase
          .from('contact_interactions')
          .select(`
            id,
            interaction_type,
            subject,
            interaction_date,
            stakeholder:stakeholders(contact_person, company_name)
          `)
          .order('interaction_date', { ascending: false })
          .limit(5),
        
        // Recent estimates
        supabase
          .from('estimates')
          .select(`
            id,
            title,
            amount,
            status,
            created_at,
            stakeholder:stakeholders(contact_person, company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recent bids
        supabase
          .from('bids')
          .select(`
            id,
            bid_amount,
            status,
            created_at,
            estimate:estimates(title, stakeholder:stakeholders(contact_person, company_name))
          `)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      // Calculate pipeline stats
      const pipelineStats = {
        leads: {
          count: leadsData?.filter(l => l.lead_status).length || 0,
          value: 0 // Leads don't have value yet
        },
        estimates: {
          count: estimatesData?.length || 0,
          value: estimatesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
        },
        bids: {
          count: bidsData?.length || 0,
          value: bidsData?.reduce((sum, b) => sum + (b.bid_amount || 0), 0) || 0
        },
        projects: {
          count: projectsData?.length || 0,
          value: projectsData?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0
        }
      };

      // Calculate total pipeline value
      const pipelineValue = pipelineStats.estimates.value + pipelineStats.bids.value;

      // Calculate conversion rate (simplified: bids won / total bids)
      const totalLeads = leadsData?.length || 0;
      const wonProjects = projectsData?.length || 0;
      const conversionRate = totalLeads > 0 ? (wonProjects / totalLeads) * 100 : 0;

      // Prepare recent activity
      const recentActivity = [
        ...(recentInteractions || []).map(item => ({
          id: item.id,
          type: 'interaction' as const,
          title: `${item.interaction_type.replace('_', ' ')} with ${item.stakeholder?.company_name || item.stakeholder?.contact_person}`,
          description: item.subject || `${item.interaction_type} interaction`,
          date: item.interaction_date,
          stakeholder: item.stakeholder?.company_name || item.stakeholder?.contact_person
        })),
        ...(recentEstimates || []).map(item => ({
          id: item.id,
          type: 'estimate' as const,
          title: `Estimate: ${item.title}`,
          description: `$${item.amount?.toLocaleString()} - ${item.status}`,
          date: item.created_at,
          stakeholder: item.stakeholder?.company_name || item.stakeholder?.contact_person
        })),
        ...(recentBids || []).map(item => ({
          id: item.id,
          type: 'bid' as const,
          title: `Bid: ${item.estimate?.title || 'Unnamed'}`,
          description: `$${item.bid_amount?.toLocaleString()} - ${item.status}`,
          date: item.created_at,
          stakeholder: item.estimate?.stakeholder?.company_name || item.estimate?.stakeholder?.contact_person
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      setMetrics({
        pipelineValue,
        conversionRate,
        activeLeads: totalLeads,
        upcomingFollowUps: followUpsData?.length || 0,
        monthlyRevenue: pipelineStats.projects.value,
        pipelineStats,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching CRM metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time updates
  const handleMetricsUpdate = useCallback(() => {
    fetchCRMMetrics();
  }, [fetchCRMMetrics]);

  // Subscribe to relevant table changes
  const { isSubscribed: stakeholdersSubscribed } = useSubscription(
    'stakeholders',
    handleMetricsUpdate,
    { userId: user?.id, enabled: !!user }
  );

  const { isSubscribed: estimatesSubscribed } = useSubscription(
    'estimates',
    handleMetricsUpdate,
    { userId: user?.id, enabled: !!user }
  );

  const { isSubscribed: bidsSubscribed } = useSubscription(
    'bids',
    handleMetricsUpdate,
    { userId: user?.id, enabled: !!user }
  );

  const { isSubscribed: interactionsSubscribed } = useSubscription(
    'contact_interactions',
    handleMetricsUpdate,
    { userId: user?.id, enabled: !!user }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchCRMMetrics();
    }
  }, [user?.id, fetchCRMMetrics]);

  const refetch = useCallback(async () => {
    await fetchCRMMetrics();
  }, [fetchCRMMetrics]);

  return { metrics, loading, refetch };
};