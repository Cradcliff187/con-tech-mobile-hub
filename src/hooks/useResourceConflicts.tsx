
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const checkResourceConflicts = async () => {
    if (!userId || !date || !hours) {
      setConflicts([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_resource_conflicts', {
        p_user_id: userId,
        p_date: date,
        p_hours: hours
      });

      if (error) {
        console.error('Error checking resource conflicts:', error);
        toast({
          title: "Error",
          description: "Failed to check resource conflicts",
          variant: "destructive"
        });
        setConflicts([]);
      } else {
        setConflicts(data || []);
      }
    } catch (error) {
      console.error('Error checking resource conflicts:', error);
      toast({
        title: "Error",
        description: "Failed to check resource conflicts",
        variant: "destructive"
      });
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && date && hours) {
      checkResourceConflicts();
    } else {
      setConflicts([]);
    }
  }, [userId, date, hours]);

  return {
    conflicts,
    loading,
    checkConflicts: checkResourceConflicts,
    hasConflicts: conflicts.length > 0
  };
};
