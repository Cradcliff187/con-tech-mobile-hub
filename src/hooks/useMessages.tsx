
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
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
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [user, projectId]);

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

    if (!error && data) {
      setMessages(prev => [data, ...prev]);
    }

    return { data, error };
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
