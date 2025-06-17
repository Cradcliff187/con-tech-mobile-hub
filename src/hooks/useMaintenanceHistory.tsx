
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MaintenanceHistoryEntry {
  id: string;
  equipment_id: string;
  maintenance_task_id?: string;
  action_type: 'task_created' | 'task_started' | 'task_completed' | 'task_cancelled' | 'status_changed' | 'assignment_changed';
  description: string;
  performed_by?: string;
  details: any;
  created_at: string;
  // Relations
  equipment?: {
    id: string;
    name: string;
  };
  maintenance_task?: {
    id: string;
    title: string;
  };
  performer?: {
    id: string;
    full_name?: string;
  };
}

export const useMaintenanceHistory = (equipmentId?: string) => {
  const [history, setHistory] = useState<MaintenanceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('maintenance_history')
        .select(`
          *,
          equipment:equipment(id, name),
          maintenance_task:maintenance_tasks(id, title),
          performer:profiles(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching maintenance history:', error);
      } else {
        // Type cast the action_type to match our interface
        const normalizedHistory = (data || []).map(entry => ({
          ...entry,
          action_type: entry.action_type as MaintenanceHistoryEntry['action_type']
        }));
        setHistory(normalizedHistory);
      }
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, equipmentId]);

  return {
    history,
    loading,
    refetch: fetchHistory
  };
};
