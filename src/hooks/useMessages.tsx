
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useImprovedMessageSubscription } from '@/hooks/messages/useImprovedMessageSubscription';

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

  // Use improved real-time subscription
  useImprovedMessageSubscription({
    user,
    onMessagesUpdate: (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
    },
    projectId
  });

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
      // Real-time subscription will handle state update
    }

    return { data, error };
  };

  // Manual refetch function for compatibility
  const refetch = async () => {
    // Real-time subscription handles automatic updates, but this is kept for compatibility
    console.log('Manual refetch called - real-time subscription should handle updates automatically');
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch
  };
};
