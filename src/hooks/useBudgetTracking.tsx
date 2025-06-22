
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

interface BudgetMetrics {
  totalBudget: number;
  currentSpend: number;
  projectedTotal: number;
  variance: number;
  lastUpdated?: Date;
}

export const useBudgetTracking = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [metrics, setMetrics] = useState<BudgetMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        if (projectId) {
          // Get project budget and current spending for specific project
          const { data: projectData } = await supabase
            .from('projects')
            .select('budget, spent')
            .eq('id', projectId)
            .single();

          const { data: budgetTrackingData } = await supabase
            .from('budget_tracking')
            .select('spent_amount, projected_total, variance_amount, last_updated')
            .eq('project_id', projectId)
            .order('last_updated', { ascending: false })
            .limit(1);

          if (projectData) {
            const totalBudget = Number(projectData.budget) || 0;
            let currentSpend = Number(projectData.spent) || 0;
            let projectedTotal = totalBudget;
            let variance = 0;
            let lastUpdated: Date | undefined;

            // Use budget tracking data if available
            if (budgetTrackingData && budgetTrackingData.length > 0) {
              const trackingData = budgetTrackingData[0];
              currentSpend = Number(trackingData.spent_amount) || currentSpend;
              projectedTotal = Number(trackingData.projected_total) || projectedTotal;
              variance = Number(trackingData.variance_amount) || (totalBudget - projectedTotal);
              lastUpdated = trackingData.last_updated ? new Date(trackingData.last_updated) : undefined;
            } else {
              // Calculate variance from project data
              variance = totalBudget - currentSpend;
            }

            setMetrics({
              totalBudget,
              currentSpend,
              projectedTotal,
              variance,
              lastUpdated
            });
          }
        } else {
          // Get aggregated data for all projects
          const { data: projectsData } = await supabase
            .from('projects')
            .select('budget, spent');

          if (projectsData) {
            const totalBudget = projectsData.reduce((sum, project) => 
              sum + (Number(project.budget) || 0), 0);
            const currentSpend = projectsData.reduce((sum, project) => 
              sum + (Number(project.spent) || 0), 0);
            
            // Get aggregated budget tracking data
            const { data: budgetTrackingData } = await supabase
              .from('budget_tracking')
              .select('projected_total, variance_amount, last_updated')
              .order('last_updated', { ascending: false });

            let projectedTotal = totalBudget;
            let variance = totalBudget - currentSpend;
            let lastUpdated: Date | undefined;

            if (budgetTrackingData && budgetTrackingData.length > 0) {
              projectedTotal = budgetTrackingData.reduce((sum, item) => 
                sum + (Number(item.projected_total) || 0), 0);
              variance = budgetTrackingData.reduce((sum, item) => 
                sum + (Number(item.variance_amount) || 0), 0);
              
              // Get most recent update
              const sortedDates = budgetTrackingData
                .filter(item => item.last_updated)
                .map(item => new Date(item.last_updated!))
                .sort((a, b) => b.getTime() - a.getTime());
              
              lastUpdated = sortedDates[0];
            }

            setMetrics({
              totalBudget,
              currentSpend,
              projectedTotal,
              variance,
              lastUpdated
            });
          }
        }

      } catch (err) {
        console.error('Error fetching budget metrics:', err);
        setError('Failed to load budget metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetMetrics();
  }, [projectId]);

  return { metrics, loading, error };
};
