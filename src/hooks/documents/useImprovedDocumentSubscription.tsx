
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/services/subscription';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  project_id?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

interface UseImprovedDocumentSubscriptionProps {
  user: any;
  onDocumentsUpdate: (documents: Document[]) => void;
  projectId?: string;
}

export const useImprovedDocumentSubscription = ({ 
  user, 
  onDocumentsUpdate,
  projectId 
}: UseImprovedDocumentSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Settings up documents real-time subscription', { projectId });

    const handleDocumentChange = async () => {
      try {
        let query = supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching documents:', error);
          return;
        }

        onDocumentsUpdate(data || []);
      } catch (error) {
        console.error('Error in documents subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { 
        table: 'documents',
        filter: projectId ? { project_id: projectId } : undefined
      },
      handleDocumentChange
    );

    // Initial fetch
    handleDocumentChange();

    return () => {
      console.log('Cleaning up documents subscription');
      unsubscribe?.();
    };
  }, [user?.id, onDocumentsUpdate, projectId]);
};
