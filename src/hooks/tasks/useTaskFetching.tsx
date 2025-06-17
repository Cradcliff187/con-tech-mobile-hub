
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { mapTaskFromDb } from './taskMapping';

export const useTaskFetching = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    if (!user) return;

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
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
      setError(error);
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
