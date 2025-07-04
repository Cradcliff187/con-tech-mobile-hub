import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { ChangeOrder, CreateChangeOrderData, UpdateChangeOrderData, ChangeOrderDocument } from '@/types/changeOrder';

export const useChangeOrders = (projectId?: string) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChangeOrders = useCallback(async () => {
    if (!user) {
      setChangeOrders([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('change_orders')
        .select(`
          *,
          project:projects(name),
          requester:profiles!requested_by(full_name, email),
          approver:profiles!approved_by(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching change orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch change orders",
          variant: "destructive"
        });
        return;
      }

      setChangeOrders(data as ChangeOrder[] || []);
    } catch (error) {
      console.error('Error in fetchChangeOrders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch change orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId, toast]);

  // Handle real-time updates
  const handleChangeOrdersUpdate = useCallback((payload: any) => {
    console.log('Change orders change detected:', payload);
    fetchChangeOrders();
  }, [fetchChangeOrders]);

  const { isSubscribed } = useSubscription(
    'change_orders',
    handleChangeOrdersUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchChangeOrders();
    } else {
      setChangeOrders([]);
      setLoading(false);
    }
  }, [user?.id, fetchChangeOrders]);

  const createChangeOrder = useCallback(async (data: CreateChangeOrderData): Promise<ChangeOrder | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: changeOrder, error } = await supabase
        .from('change_orders')
        .insert({
          ...data,
          requested_by: user.id
        })
        .select(`
          *,
          project:projects(name),
          requester:profiles!requested_by(full_name, email),
          approver:profiles!approved_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Change order created successfully"
      });

      return changeOrder as ChangeOrder;
    } catch (error: any) {
      console.error('Error creating change order:', error);
      toast({
        title: "Error",
        description: `Failed to create change order: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const updateChangeOrder = useCallback(async (id: string, data: UpdateChangeOrderData): Promise<ChangeOrder | null> => {
    try {
      const updateData: any = { ...data };
      
      // Add approval metadata if approving
      if (data.status === 'approved' && user) {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { data: changeOrder, error } = await supabase
        .from('change_orders')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          project:projects(name),
          requester:profiles!requested_by(full_name, email),
          approver:profiles!approved_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Change order updated successfully"
      });

      return changeOrder as ChangeOrder;
    } catch (error: any) {
      console.error('Error updating change order:', error);
      toast({
        title: "Error",
        description: `Failed to update change order: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const deleteChangeOrder = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('change_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Change order deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting change order:', error);
      toast({
        title: "Error",
        description: `Failed to delete change order: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    changeOrders,
    loading,
    createChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
    refetch: fetchChangeOrders
  };
};

export const useChangeOrderDocuments = (changeOrderId?: string) => {
  const [documents, setDocuments] = useState<ChangeOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChangeOrderDocuments = useCallback(async () => {
    if (!user || !changeOrderId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('change_order_documents')
        .select(`
          *,
          document:documents(*)
        `)
        .eq('change_order_id', changeOrderId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching change order documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch change order documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, changeOrderId, toast]);

  useEffect(() => {
    fetchChangeOrderDocuments();
  }, [fetchChangeOrderDocuments]);

  const attachDocument = useCallback(async (documentId: string): Promise<void> => {
    if (!changeOrderId) throw new Error('Change order ID is required');

    try {
      const { error } = await supabase
        .from('change_order_documents')
        .insert({
          change_order_id: changeOrderId,
          document_id: documentId,
          relationship_type: 'supporting'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document attached to change order"
      });

      fetchChangeOrderDocuments();
    } catch (error: any) {
      console.error('Error attaching document:', error);
      toast({
        title: "Error",
        description: `Failed to attach document: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [changeOrderId, fetchChangeOrderDocuments, toast]);

  const detachDocument = useCallback(async (documentId: string): Promise<void> => {
    if (!changeOrderId) throw new Error('Change order ID is required');

    try {
      const { error } = await supabase
        .from('change_order_documents')
        .delete()
        .eq('change_order_id', changeOrderId)
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document detached from change order"
      });

      fetchChangeOrderDocuments();
    } catch (error: any) {
      console.error('Error detaching document:', error);
      toast({
        title: "Error",
        description: `Failed to detach document: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [changeOrderId, fetchChangeOrderDocuments, toast]);

  return {
    documents,
    loading,
    attachDocument,
    detachDocument,
    refetch: fetchChangeOrderDocuments
  };
};