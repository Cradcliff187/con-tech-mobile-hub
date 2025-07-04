import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { RFI, CreateRFIData, UpdateRFIData, RFIDocument } from '@/types/rfi';

export const useRFIs = (projectId?: string) => {
  const [rfis, setRFIs] = useState<RFI[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRFIs = useCallback(async () => {
    if (!user) {
      setRFIs([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('rfis')
        .select(`
          *,
          project:projects(name),
          submitter:profiles!submitted_by(full_name, email),
          assignee:profiles!assigned_to(full_name, email),
          responder:profiles!responded_by(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching RFIs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch RFIs",
          variant: "destructive"
        });
        return;
      }

      setRFIs(data as RFI[] || []);
    } catch (error) {
      console.error('Error in fetchRFIs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch RFIs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId, toast]);

  // Handle real-time updates
  const handleRFIsUpdate = useCallback((payload: any) => {
    console.log('RFIs change detected:', payload);
    fetchRFIs();
  }, [fetchRFIs]);

  const { isSubscribed } = useSubscription(
    'rfis',
    handleRFIsUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchRFIs();
    } else {
      setRFIs([]);
      setLoading(false);
    }
  }, [user?.id, fetchRFIs]);

  const createRFI = useCallback(async (data: CreateRFIData): Promise<RFI | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: rfi, error } = await supabase
        .from('rfis')
        .insert({
          ...data,
          submitted_by: user.id
        })
        .select(`
          *,
          project:projects(name),
          submitter:profiles!submitted_by(full_name, email),
          assignee:profiles!assigned_to(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "RFI created successfully"
      });

      return rfi as RFI;
    } catch (error: any) {
      console.error('Error creating RFI:', error);
      toast({
        title: "Error",
        description: `Failed to create RFI: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const updateRFI = useCallback(async (id: string, data: UpdateRFIData): Promise<RFI | null> => {
    try {
      const updateData: any = { ...data };
      
      // Add response metadata if responding
      if (data.response && user) {
        updateData.responded_by = user.id;
        updateData.responded_at = new Date().toISOString();
        if (data.status === undefined) {
          updateData.status = 'closed';
        }
      }

      const { data: rfi, error } = await supabase
        .from('rfis')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          project:projects(name),
          submitter:profiles!submitted_by(full_name, email),
          assignee:profiles!assigned_to(full_name, email),
          responder:profiles!responded_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "RFI updated successfully"
      });

      return rfi as RFI;
    } catch (error: any) {
      console.error('Error updating RFI:', error);
      toast({
        title: "Error",
        description: `Failed to update RFI: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const deleteRFI = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('rfis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "RFI deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting RFI:', error);
      toast({
        title: "Error",
        description: `Failed to delete RFI: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    rfis,
    loading,
    createRFI,
    updateRFI,
    deleteRFI,
    refetch: fetchRFIs
  };
};

export const useRFIDocuments = (rfiId?: string) => {
  const [documents, setDocuments] = useState<RFIDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRFIDocuments = useCallback(async () => {
    if (!user || !rfiId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rfi_documents')
        .select(`
          *,
          document:documents(*)
        `)
        .eq('rfi_id', rfiId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching RFI documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch RFI documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, rfiId, toast]);

  useEffect(() => {
    fetchRFIDocuments();
  }, [fetchRFIDocuments]);

  const attachDocument = useCallback(async (documentId: string): Promise<void> => {
    if (!rfiId) throw new Error('RFI ID is required');

    try {
      const { error } = await supabase
        .from('rfi_documents')
        .insert({
          rfi_id: rfiId,
          document_id: documentId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document attached to RFI"
      });

      fetchRFIDocuments();
    } catch (error: any) {
      console.error('Error attaching document:', error);
      toast({
        title: "Error",
        description: `Failed to attach document: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [rfiId, fetchRFIDocuments, toast]);

  const detachDocument = useCallback(async (documentId: string): Promise<void> => {
    if (!rfiId) throw new Error('RFI ID is required');

    try {
      const { error } = await supabase
        .from('rfi_documents')
        .delete()
        .eq('rfi_id', rfiId)
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document detached from RFI"
      });

      fetchRFIDocuments();
    } catch (error: any) {
      console.error('Error detaching document:', error);
      toast({
        title: "Error",
        description: `Failed to detach document: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [rfiId, fetchRFIDocuments, toast]);

  return {
    documents,
    loading,
    attachDocument,
    detachDocument,
    refetch: fetchRFIDocuments
  };
};