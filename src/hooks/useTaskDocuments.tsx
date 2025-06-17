
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TaskDocument {
  id: string;
  task_id: string;
  document_id: string;
  relationship_type: 'attachment' | 'reference' | 'requirement';
  created_at: string;
  created_by?: string;
  document?: {
    id: string;
    name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    category?: string;
    created_at: string;
    updated_at: string;
  };
}

export const useTaskDocuments = (taskId?: string) => {
  const [taskDocuments, setTaskDocuments] = useState<TaskDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTaskDocuments = useCallback(async () => {
    if (!user || !taskId) {
      setTaskDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('task_documents')
        .select(`
          *,
          document:documents(
            id,
            name,
            file_path,
            file_size,
            file_type,
            category,
            created_at,
            updated_at
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch task documents: ${error.message}`);
      }

      // Type cast the data to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        relationship_type: item.relationship_type as 'attachment' | 'reference' | 'requirement'
      })) as TaskDocument[];

      setTaskDocuments(typedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch task documents');
      console.error('Error fetching task documents:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [user, taskId]);

  useEffect(() => {
    fetchTaskDocuments();
  }, [fetchTaskDocuments]);

  const attachDocument = useCallback(async (
    documentId: string, 
    relationshipType: 'attachment' | 'reference' | 'requirement' = 'attachment'
  ) => {
    if (!user || !taskId) return { error: 'User not authenticated or task not specified' };

    try {
      const { data, error } = await supabase
        .from('task_documents')
        .insert({
          task_id: taskId,
          document_id: documentId,
          relationship_type: relationshipType,
          created_by: user.id
        })
        .select(`
          *,
          document:documents(
            id,
            name,
            file_path,
            file_size,
            file_type,
            category,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Document is already attached to this task');
        }
        throw new Error(`Failed to attach document: ${error.message}`);
      }

      if (data) {
        // Type cast the response data
        const typedData = {
          ...data,
          relationship_type: data.relationship_type as 'attachment' | 'reference' | 'requirement'
        } as TaskDocument;

        setTaskDocuments(prev => [typedData, ...prev]);
        toast({
          title: "Document attached",
          description: "Document has been successfully attached to the task."
        });
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach document';
      console.error('Error attaching document:', err);
      toast({
        title: "Error attaching document",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  }, [user, taskId, toast]);

  const detachDocument = useCallback(async (taskDocumentId: string) => {
    try {
      const { error } = await supabase
        .from('task_documents')
        .delete()
        .eq('id', taskDocumentId);

      if (error) {
        throw new Error(`Failed to detach document: ${error.message}`);
      }

      setTaskDocuments(prev => prev.filter(td => td.id !== taskDocumentId));
      toast({
        title: "Document detached",
        description: "Document has been successfully detached from the task."
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detach document';
      console.error('Error detaching document:', err);
      toast({
        title: "Error detaching document",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  }, [toast]);

  const updateRelationshipType = useCallback(async (
    taskDocumentId: string, 
    newType: 'attachment' | 'reference' | 'requirement'
  ) => {
    try {
      const { data, error } = await supabase
        .from('task_documents')
        .update({ relationship_type: newType })
        .eq('id', taskDocumentId)
        .select(`
          *,
          document:documents(
            id,
            name,
            file_path,
            file_size,
            file_type,
            category,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update relationship type: ${error.message}`);
      }

      if (data) {
        // Type cast the response data
        const typedData = {
          ...data,
          relationship_type: data.relationship_type as 'attachment' | 'reference' | 'requirement'
        } as TaskDocument;

        setTaskDocuments(prev => prev.map(td => 
          td.id === taskDocumentId ? typedData : td
        ));
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update relationship type';
      console.error('Error updating relationship type:', err);
      return { error: errorMessage };
    }
  }, []);

  return {
    taskDocuments,
    loading,
    error,
    attachDocument,
    detachDocument,
    updateRelationshipType,
    refetch: fetchTaskDocuments
  };
};
