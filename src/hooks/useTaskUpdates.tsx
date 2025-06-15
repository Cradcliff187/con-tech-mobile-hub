
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TaskUpdate {
  id: string;
  task_id: string;
  message: string;
  author_id?: string;
  author_name?: string;
  created_at: string;
}

export const useTaskUpdates = (taskId?: string) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUpdates = async () => {
    if (!user || !taskId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_updates')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task updates:', error);
      } else {
        setUpdates(data || []);
      }
    } catch (error) {
      console.error('Error fetching task updates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [user, taskId]);

  const addUpdate = async (message: string, authorName?: string) => {
    if (!user || !taskId) return { error: 'Missing required data' };

    const { data, error } = await supabase
      .from('task_updates')
      .insert({
        task_id: taskId,
        message,
        author_id: user.id,
        author_name: authorName
      })
      .select()
      .single();

    if (!error && data) {
      setUpdates(prev => [data, ...prev]);
    }

    return { data, error };
  };

  return {
    updates,
    loading,
    addUpdate,
    refetch: fetchUpdates
  };
};
