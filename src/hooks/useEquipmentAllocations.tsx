import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { prepareOptionalSelectField } from '@/utils/selectHelpers';

export interface EquipmentAllocation {
  id: string;
  equipment_id: string;
  project_id: string;
  task_id?: string | null;
  operator_type?: 'employee' | 'user' | null;
  operator_id?: string | null;
  start_date: string;
  end_date: string;
  allocated_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string } | null;
  equipment?: { id: string; name: string; type: string } | null;
  task?: { id: string; title: string } | null;
  operator_stakeholder?: { id: string; contact_person?: string; company_name?: string } | null;
  operator_user?: { id: string; full_name?: string } | null;
}

export const useEquipmentAllocations = (equipmentId?: string, projectId?: string) => {
  const [allocations, setAllocations] = useState<EquipmentAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAllocations = useCallback(async () => {
    if (!user) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('equipment_allocations')
        .select(`
          *,
          project:projects!inner(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title)
        `)
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching equipment allocations:', error);
        setAllocations([]);
        return;
      }

      // Process allocations with operator details and proper type casting
      const processedAllocations = await Promise.all(
        (data || []).map(async (allocation) => {
          let operator_stakeholder = null;
          let operator_user = null;

          if (allocation.operator_id && allocation.operator_type) {
            if (allocation.operator_type === 'employee') {
              const { data: stakeholder } = await supabase
                .from('stakeholders')
                .select('id, contact_person, company_name')
                .eq('id', allocation.operator_id)
                .single();
              operator_stakeholder = stakeholder;
            } else if (allocation.operator_type === 'user') {
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', allocation.operator_id)
                .single();
              operator_user = userProfile;
            }
          }

          return {
            ...allocation,
            operator_type: allocation.operator_type as 'employee' | 'user' | null,
            operator_stakeholder,
            operator_user
          } as EquipmentAllocation;
        })
      );

      setAllocations(processedAllocations);
    } catch (error) {
      console.error('Error in fetchAllocations:', error);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, equipmentId, projectId]);

  useEffect(() => {
    if (!user) {
      setAllocations([]);
      setLoading(false);
      return;
    }

    // Simple subscription without complex manager
    const channel = supabase
      .channel('equipment_allocations_simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_allocations'
        },
        () => {
          fetchAllocations();
        }
      )
      .subscribe();

    // Initial fetch
    fetchAllocations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllocations]);

  const createAllocation = useCallback(async (allocationData: {
    equipment_id: string;
    project_id: string;
    task_id?: string;
    operator_type?: 'employee' | 'user';
    operator_id?: string;
    start_date: string;
    end_date: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // Prepare data for database with proper field handling
      const dbData = {
        equipment_id: allocationData.equipment_id,
        project_id: allocationData.project_id,
        task_id: prepareOptionalSelectField(allocationData.task_id),
        operator_type: allocationData.operator_type || null,
        operator_id: prepareOptionalSelectField(allocationData.operator_id),
        start_date: allocationData.start_date,
        end_date: allocationData.end_date,
        notes: allocationData.notes || null,
        allocated_by: user.id
      };

      const { data, error } = await supabase
        .from('equipment_allocations')
        .insert(dbData)
        .select(`
          *,
          project:projects!inner(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment allocation created successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating allocation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create allocation",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [user, toast]);

  const updateAllocation = useCallback(async (id: string, updates: Partial<EquipmentAllocation>) => {
    try {
      // Prepare updates for database with proper field handling
      const dbUpdates: any = {};
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof EquipmentAllocation];
        if (key === 'task_id' || key === 'operator_id') {
          dbUpdates[key] = prepareOptionalSelectField(value as string);
        } else {
          dbUpdates[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('equipment_allocations')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          project:projects!inner(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment allocation updated successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating allocation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update allocation",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [toast]);

  const deleteAllocation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipment_allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment allocation deleted successfully"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting allocation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete allocation",
        variant: "destructive"
      });
      return { error: error.message };
    }
  }, [toast]);

  const checkAvailability = useCallback(async (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeAllocationId?: string
  ) => {
    const { data, error } = await supabase.rpc('check_equipment_availability', {
      p_equipment_id: equipmentId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_exclude_allocation_id: excludeAllocationId || null
    });

    return { isAvailable: data, error };
  }, []);

  const getConflictingAllocations = useCallback(async (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeAllocationId?: string
  ) => {
    let query = supabase
      .from('equipment_allocations')
      .select(`
        *,
        project:projects!inner(id, name)
      `)
      .eq('equipment_id', equipmentId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (excludeAllocationId) {
      query = query.neq('id', excludeAllocationId);
    }

    const { data, error } = await query;
    
    return { conflicts: data || [], error };
  }, []);

  const createBulkAllocations = useCallback(async (allocationsData: Array<{
    equipment_id: string;
    project_id: string;
    task_id?: string;
    operator_type?: 'employee' | 'user';
    operator_id?: string;
    start_date: string;
    end_date: string;
    notes?: string;
  }>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const dbDataArray = allocationsData.map(allocationData => ({
        equipment_id: allocationData.equipment_id,
        project_id: allocationData.project_id,
        task_id: prepareOptionalSelectField(allocationData.task_id),
        operator_type: allocationData.operator_type || null,
        operator_id: prepareOptionalSelectField(allocationData.operator_id),
        start_date: allocationData.start_date,
        end_date: allocationData.end_date,
        notes: allocationData.notes || null,
        allocated_by: user.id
      }));

      const { data, error } = await supabase
        .from('equipment_allocations')
        .insert(dbDataArray)
        .select(`
          *,
          project:projects!inner(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title)
        `);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${data.length} equipment allocations created successfully`
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating bulk allocations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create allocations",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [user, toast]);

  return {
    allocations,
    loading,
    createAllocation,
    createBulkAllocations,
    updateAllocation,
    deleteAllocation,
    checkAvailability,
    getConflictingAllocations
  };
};
