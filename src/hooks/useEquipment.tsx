
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  project_id?: string;
  operator_id?: string;
  maintenance_due?: string;
  utilization_rate: number;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string };
  operator?: { id: string; full_name?: string };
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEquipment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          project:projects(id, name),
          operator:profiles(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
      } else {
        setEquipment(data || []);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [user]);

  return { 
    equipment, 
    loading, 
    refetch: fetchEquipment 
  };
};
