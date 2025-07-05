import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import type { EquipmentServiceRecord, CreateServiceRecordData, ServiceRecordWithDocument } from '@/types/equipmentService';

export const useEquipmentServiceRecords = (equipmentId?: string) => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordWithDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchServiceRecords = useCallback(async () => {
    if (!user || !equipmentId) {
      setServiceRecords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment_service_documents')
        .select(`
          *,
          document:documents!inner(
            id,
            name,
            file_path,
            file_size,
            file_type,
            created_at
          )
        `)
        .eq('equipment_id', equipmentId)
        .order('service_date', { ascending: false });

      if (error) {
        console.error('Error fetching service records:', error);
        setServiceRecords([]);
        return;
      }

      setServiceRecords(data || []);
    } catch (error) {
      console.error('Error in fetchServiceRecords:', error);
      setServiceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, equipmentId]);

  // Handle real-time updates
  const handleServiceRecordsUpdate = useCallback((payload: any) => {
    console.log('Service records change detected:', payload);
    fetchServiceRecords();
  }, [fetchServiceRecords]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'equipment_service_documents',
    handleServiceRecordsUpdate,
    {
      userId: user?.id,
      enabled: !!user && !!equipmentId
    }
  );

  // Initial fetch
  useEffect(() => {
    if (user && equipmentId) {
      fetchServiceRecords();
    } else {
      setServiceRecords([]);
      setLoading(false);
    }
  }, [user?.id, equipmentId, fetchServiceRecords]);

  const createServiceRecord = useCallback(async (data: CreateServiceRecordData) => {
    try {
      const { data: result, error } = await supabase
        .from('equipment_service_documents')
        .insert(data)
        .select(`
          *,
          document:documents!inner(
            id,
            name,
            file_path,
            file_size,
            file_type,
            created_at
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create service record: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Service record created successfully"
      });

      return { data: result, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service record';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const deleteServiceRecord = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipment_service_documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete service record: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Service record deleted successfully"
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service record';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getNextServiceDue = useCallback((maintenanceDue?: string) => {
    if (!serviceRecords.length && !maintenanceDue) return null;
    
    // Use the latest service date or equipment maintenance_due field
    const latestServiceDate = serviceRecords.length > 0 
      ? serviceRecords[0].service_date 
      : maintenanceDue;
    
    if (!latestServiceDate) return null;
    
    // Calculate next service due (assuming 90-day intervals for routine maintenance)
    const lastService = new Date(latestServiceDate);
    const nextDue = new Date(lastService);
    nextDue.setDate(nextDue.getDate() + 90);
    
    return nextDue.toISOString().split('T')[0];
  }, [serviceRecords]);

  const isServiceOverdue = useCallback((nextServiceDue?: string) => {
    if (!nextServiceDue) return false;
    return new Date(nextServiceDue) < new Date();
  }, []);

  return {
    serviceRecords,
    loading,
    createServiceRecord,
    deleteServiceRecord,
    getNextServiceDue,
    isServiceOverdue,
    refetch: fetchServiceRecords
  };
};