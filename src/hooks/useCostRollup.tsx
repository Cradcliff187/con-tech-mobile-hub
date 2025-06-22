
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UtilizationData {
  stakeholder_id: string;
  stakeholder_name: string;
  date_period: string;
  total_allocated_hours: number;
  max_available_hours: number;
  utilization_percentage: number;
  is_overallocated: boolean;
  conflict_details: any;
  project_assignments: any[];
}

interface CostRollupSummary {
  project_id: string;
  old_spent: number;
  new_spent: number;
  variance: number;
  variance_percentage: number;
}

export const useCostRollup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateProjectCosts = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: functionError } = await supabase.rpc('update_project_labor_costs', {
        target_project_id: projectId
      });

      if (functionError) {
        throw functionError;
      }

      toast({
        title: "Success",
        description: "Project costs updated successfully"
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error updating project costs:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to update project costs",
        variant: "destructive"
      });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateEmployeeUtilization = useCallback(async (
    stakeholderId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.rpc('calculate_employee_utilization', {
        target_stakeholder_id: stakeholderId || null,
        start_date: startDate || null,
        end_date: endDate || null
      });

      if (functionError) {
        throw functionError;
      }

      return { success: true, data: data as UtilizationData[] };
    } catch (err: any) {
      console.error('Error calculating utilization:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to calculate employee utilization",
        variant: "destructive"
      });
      return { success: false, error: err, data: [] };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const triggerCostSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: functionError } = await supabase.rpc('create_daily_cost_snapshot');

      if (functionError) {
        throw functionError;
      }

      toast({
        title: "Success",
        description: "Cost snapshot created successfully"
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error creating cost snapshot:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to create cost snapshot",
        variant: "destructive"
      });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    updateProjectCosts,
    calculateEmployeeUtilization,
    triggerCostSnapshot
  };
};
