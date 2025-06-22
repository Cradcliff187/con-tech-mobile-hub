
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectLaborCost {
  project_id: string;
  stakeholder_type: string;
  project_name: string;
  assignment_count: number;
  total_hours: number;
  total_cost: number;
  avg_hourly_rate: number;
  earliest_start_date: string | null;
  latest_end_date: string | null;
}

export const useProjectLaborCosts = (projectId?: string) => {
  const [laborCosts, setLaborCosts] = useState<ProjectLaborCost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLaborCosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('project_labor_costs')
        .select('*')
        .order('project_id');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLaborCosts(data || []);
    } catch (error: any) {
      console.error('Error fetching labor costs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project labor costs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaborCosts();
  }, [projectId]);

  return {
    laborCosts,
    loading,
    refetch: fetchLaborCosts
  };
};
