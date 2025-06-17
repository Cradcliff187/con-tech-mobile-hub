
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TaskDocument {
  id: string;
  task_id: string;
  document_id: string;
  attached_at: string;
  attached_by: string;
  document?: {
    id: string;
    name: string;
    file_path: string;
    file_type?: string;
    category?: string;
  };
}

export const useTaskDocuments = (taskId?: string) => {
  const [taskDocuments, setTaskDocuments] = useState<TaskDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTaskDocuments = useCallback(async () => {
    if (!taskId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_documents')
        .select(`
          *,
          document:documents(
            id,
            name,
            file_path,
            file_type,
            category
          )
        `)
        .eq('task_id', taskId)
        .order('attached_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch task documents: ${error.message}`);
      }

      setTaskDocuments(data || []);
    } catch (error) {
      console.error('Error fetching task documents:', error);
      toast({
        title: "Error loading documents",
        description: error instanceof Error ? error.message : "Failed to load task documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [taskId, user, toast]);

  const attachDocument = useCallback(async (documentId: string) => {
    if (!taskId || !user) return { error: 'Missing required data' };

    try {
      const { data, error } = await supabase
        .from('task_documents')
        .insert({
          task_id: taskId,
          document_id: documentId,
          attached_by: user.id
        })
        .select(`
          *,
          document:documents(
            id,
            name,
            file_path,
            file_type,
            category
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to attach document: ${error.message}`);
      }

      if (data) {
        setTaskDocuments(prev => [data, ...prev]);
        toast({
          title: "Document attached",
          description: "Document has been attached to the task successfully"
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error attaching document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to attach document';
      toast({
        title: "Attachment failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  }, [taskId, user, toast]);

  const detachDocument = useCallback(async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from('task_documents')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        throw new Error(`Failed to detach document: ${error.message}`);
      }

      setTaskDocuments(prev => prev.filter(doc => doc.id !== attachmentId));
      toast({
        title: "Document detached",
        description: "Document has been removed from the task"
      });

      return { error: null };
    } catch (error) {
      console.error('Error detaching document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to detach document';
      toast({
        title: "Detachment failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  }, [toast]);

  return {
    taskDocuments,
    loading,
    fetchTaskDocuments,
    attachDocument,
    detachDocument
  };
};
