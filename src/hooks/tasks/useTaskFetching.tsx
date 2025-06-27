
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { mapTaskFromDb } from './taskMapping';

export const useTaskFetching = (sessionReady: boolean) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!sessionReady) return [];

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      } else {
        const mappedTasks: Task[] = (data || []).map(mapTaskFromDb);
        return mappedTasks;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      console.error('Error fetching tasks:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchTasks
  };
};
