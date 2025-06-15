
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResourceConflict {
  conflict_type: string;
  conflicting_allocation_id: string;
  conflicting_team_name: string;
  allocated_hours: number;
  available_hours: number;
}

export const useResourceConflicts = (userId?: string, date?: string, hours?: number) => {
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && date && hours) {
      checkResourceConflicts();
    }
  }, [userId, date, hours]);

  const checkResourceConflicts = async () => {
    if (!userId || !date || !hours) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_resource_conflicts', {
        p_user_id: userId,
        p_date: date,
        p_hours: hours
      });

      if (error) throw error;
      setConflicts(data || []);
    } catch (error) {
      console.error('Error checking resource conflicts:', error);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    conflicts,
    loading,
    checkConflicts: checkResourceConflicts
  };
};
