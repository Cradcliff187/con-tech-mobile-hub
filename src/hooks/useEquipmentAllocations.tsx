
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EquipmentAllocation {
  id: string;
  equipment_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocated_by?: string;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string };
  equipment?: { id: string; name: string; type: string };
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
          equipment:equipment(id, name, type)
        `)
        .order('start_date', { ascending: true });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching equipment allocations:', error);
      } else {
        setAllocations(data || []);
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
    start_date: string;
    end_date: string;
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
        equipment:equipment(id, name, type)
      `)
      .single();

    if (!error && data) {
      setAllocations(prev => [...prev, data]);
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
        equipment:equipment(id, name, type)
      `)
      .single();

    if (!error && data) {
      setAllocations(prev => prev.map(allocation => 
        allocation.id === id ? data : allocation
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
    refetch: fetchAllocations
  };
};
