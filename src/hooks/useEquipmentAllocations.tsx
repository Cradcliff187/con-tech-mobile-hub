
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EquipmentAllocation {
  id: string;
  equipment_id: string;
  project_id: string;
  task_id?: string;
  operator_type?: 'employee' | 'user';
  operator_id?: string;
  start_date: string;
  end_date: string;
  allocated_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string };
  equipment?: { id: string; name: string; type: string };
  task?: { id: string; title: string };
  operator_stakeholder?: { id: string; contact_person?: string; company_name?: string };
  operator_user?: { id: string; full_name?: string };
}

export const useEquipmentAllocations = (equipmentId?: string) => {
  const [allocations, setAllocations] = useState<EquipmentAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllocations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('equipment_allocations')
        .select(`
          *,
          project:projects(id, name),
          equipment:equipment(id, name, type),
          task:tasks(id, title),
          operator_stakeholder:stakeholders!operator_id(id, contact_person, company_name),
          operator_user:profiles!operator_id(id, full_name)
        `)
        .order('start_date', { ascending: true });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching equipment allocations:', error);
      } else {
        // Type cast the data to ensure proper typing
        const typedAllocations = (data || []).map(allocation => ({
          ...allocation,
          operator_type: allocation.operator_type as 'employee' | 'user' | undefined
        }));
        setAllocations(typedAllocations);
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

    const { data, error } = await supabase
      .from('equipment_allocations')
      .insert({
        ...allocationData,
        allocated_by: user.id
      })
      .select(`
        *,
        project:projects(id, name),
        equipment:equipment(id, name, type),
        task:tasks(id, title),
        operator_stakeholder:stakeholders!operator_id(id, contact_person, company_name),
        operator_user:profiles!operator_id(id, full_name)
      `)
      .single();

    if (!error && data) {
      const typedAllocation = {
        ...data,
        operator_type: data.operator_type as 'employee' | 'user' | undefined
      };
      setAllocations(prev => [...prev, typedAllocation]);
    }

    return { data, error };
  };

  const updateAllocation = async (id: string, updates: Partial<EquipmentAllocation>) => {
    const { data, error } = await supabase
      .from('equipment_allocations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name),
        equipment:equipment(id, name, type),
        task:tasks(id, title),
        operator_stakeholder:stakeholders!operator_id(id, contact_person, company_name),
        operator_user:profiles!operator_id(id, full_name)
      `)
      .single();

    if (!error && data) {
      const typedAllocation = {
        ...data,
        operator_type: data.operator_type as 'employee' | 'user' | undefined
      };
      setAllocations(prev => prev.map(allocation => 
        allocation.id === id ? typedAllocation : allocation
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
        project:projects(id, name),
        operator_stakeholder:stakeholders!operator_id(id, contact_person, company_name),
        operator_user:profiles!operator_id(id, full_name)
      `)
      .eq('equipment_id', equipmentId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (excludeAllocationId) {
      query = query.neq('id', excludeAllocationId);
    }

    const { data, error } = await query;
    return { conflicts: data || [], error };
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
