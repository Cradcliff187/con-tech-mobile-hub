import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CRMGoals {
  revenue_target: number;
  leads_target: number;
  estimates_target: number;
  bids_target: number;
  conversion_rate_target: number;
}

export interface CompanySettings {
  crm_monthly_goals: CRMGoals;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    crm_monthly_goals: {
      revenue_target: 100000,
      leads_target: 25,
      estimates_target: 15,
      bids_target: 10,
      conversion_rate_target: 20
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'crm_monthly_goals')
        .single();

      if (!error && data) {
        setSettings({
          crm_monthly_goals: data.setting_value as unknown as CRMGoals
        });
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCRMGoals = useCallback(async (goals: CRMGoals) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          setting_key: 'crm_monthly_goals',
          setting_value: goals as any,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        crm_monthly_goals: goals
      }));

      toast({
        title: "Settings Updated",
        description: "CRM monthly goals have been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating CRM goals:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update CRM goals. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateCRMGoals,
    refetch: fetchSettings
  };
};