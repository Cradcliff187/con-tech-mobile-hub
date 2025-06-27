
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface Message {
  id: string;
  project_id?: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender?: {
    full_name?: string;
    email: string;
  };
}

export const useMessages = (projectId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId]);

  // Handle real-time updates using centralized subscription manager
  const handleMessagesUpdate = useCallback((payload: any) => {
    console.log('Messages change detected:', payload);
    fetchMessages();
  }, [fetchMessages]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'messages',
    handleMessagesUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [user?.id, fetchMessages]);

  const sendMessage = async (content: string, messageType: string = 'text', targetProjectId?: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        message_type: messageType,
        project_id: targetProjectId || projectId,
        sender_id: user.id
      })
      .select(`
        *,
        sender:profiles!sender_id(full_name, email)
      `)
      .single();

    return { data, error };
  };

  const refetch = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    refetch
  };
};
