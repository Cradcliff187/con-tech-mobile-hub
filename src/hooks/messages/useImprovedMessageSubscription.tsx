
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

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

interface UseImprovedMessageSubscriptionProps {
  user: any;
  onMessagesUpdate: (messages: Message[]) => void;
  projectId?: string;
}

export const useImprovedMessageSubscription = ({ 
  user, 
  onMessagesUpdate,
  projectId 
}: UseImprovedMessageSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up messages real-time subscription', { projectId });

    const handleMessageChange = async () => {
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
          return;
        }

        onMessagesUpdate(data || []);
      } catch (error) {
        console.error('Error in messages subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'messages',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleMessageChange
    );

    // Initial fetch
    handleMessageChange();

    return () => {
      console.log('Cleaning up messages subscription');
      unsubscribe?.();
    };
  }, [user?.id, onMessagesUpdate, projectId]);
};
