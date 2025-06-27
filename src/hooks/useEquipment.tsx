
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Equipment {
  id: string;
  name: string;
  type?: string;
  status: string;
  project_id?: string;
  operator_id?: string;
  assigned_operator_id?: string;
  maintenance_due?: string;
  utilization_rate?: number;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string };
  operator?: { id: string; full_name?: string };
  assigned_operator?: { id: string; contact_person?: string; company_name?: string };
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEquipment = useCallback(async () => {
    if (!user) {
      setEquipment([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          project:projects(id, name),
          operator:profiles!operator_id(id, full_name),
          assigned_operator:stakeholders!assigned_operator_id(id, contact_person, company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        setEquipment([]);
        return;
      }

      setEquipment(data || []);
    } catch (error) {
      console.error('Error in fetchEquipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setEquipment([]);
      setLoading(false);
      return;
    }

    // Simple subscription without complex manager
    const channel = supabase
      .channel('equipment_simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment'
        },
        () => {
          fetchEquipment();
        }
      )
      .subscribe();

    // Initial fetch
    fetchEquipment();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEquipment]);

  const refetch = useCallback(async () => {
    await fetchEquipment();
  }, [fetchEquipment]);

  return { 
    equipment, 
    loading,
    refetch
  };
};
