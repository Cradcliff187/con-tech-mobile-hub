import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

export const useEquipmentAllocations = (equipmentId?: string) => {
  const [allocations, setAllocations] = useState<EquipmentAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOperatorDetails = async (allocation: any) => {
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
      operator_stakeholder,
      operator_user
    };
  };

  const processAllocationData = async (rawData: any): Promise<EquipmentAllocation> => {
    return await fetchOperatorDetails(rawData);
  };

  const fetchAllocations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('equipment_allocations')
        .select(`
          *,
          project:projects!inner(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title)
        `)
        .order('start_date', { ascending: true });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching equipment allocations:', error);
      } else {
        // Process allocations with operator details
        const processedData = await Promise.all(
          (data || []).map(allocation => processAllocationData(allocation))
        );
        setAllocations(processedData);
      }
    } catch (error) {
      console.error('Error fetching equipment allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAllocation = async (allocationData: {
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

    if (!error && data) {
      const processedAllocation = await processAllocationData(data);
      setAllocations(prev => [...prev, processedAllocation]);
    }

    return { data, error };
  };

  const updateAllocation = async (id: string, updates: Partial<EquipmentAllocation>) => {
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

    if (!error && data) {
      const processedAllocation = await processAllocationData(data);
      setAllocations(prev => prev.map(allocation => 
        allocation.id === id ? processedAllocation : allocation
      ));
    }

    return { data, error };
  };

  const deleteAllocation = async (id: string) => {
    const { error } = await supabase
      .from('equipment_allocations')
      .delete()
      .eq('id', id);

    if (!error) {
      setAllocations(prev => prev.filter(allocation => allocation.id !== id));
    }

    return { error };
  };

  const checkAvailability = async (
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
  };

  const getConflictingAllocations = async (
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
    
    // Process conflicts with operator details
    const processedConflicts = await Promise.all(
      (data || []).map(allocation => processAllocationData(allocation))
    );
    return { conflicts: processedConflicts, error };
  };

  useEffect(() => {
    fetchAllocations();
  }, [user, equipmentId]);

  return {
    allocations,
    loading,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    checkAvailability,
    getConflictingAllocations,
    refetch: fetchAllocations
  };
};
