
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentAssignmentHistory {
  id: string;
  equipment_id: string;
  project_id?: string | null;
  operator_id?: string | null;
  assigned_operator_id?: string | null;
  assigned_by?: string | null;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  created_at: string;
  project?: { id: string; name: string } | null;
  operator?: { id: string; full_name?: string } | null;
  assigned_operator?: { id: string; contact_person?: string; company_name?: string } | null;
  assigned_by_user?: { id: string; full_name?: string } | null;
}

// Helper function to check if a value is a SelectQueryError
const isSelectQueryError = (value: any): boolean => {
  return value && typeof value === 'object' && value.error === true;
};

// Process raw history data to handle SelectQueryError objects
const processHistoryData = (rawData: any[]): EquipmentAssignmentHistory[] => {
  return rawData.map(record => ({
    ...record,
    project: isSelectQueryError(record.project) ? null : record.project,
    operator: isSelectQueryError(record.operator) ? null : record.operator,
    assigned_operator: isSelectQueryError(record.assigned_operator) ? null : record.assigned_operator,
    assigned_by_user: isSelectQueryError(record.assigned_by_user) ? null : record.assigned_by_user,
  }));
};

export const useEquipmentAssignmentHistory = (equipmentId?: string) => {
  const [history, setHistory] = useState<EquipmentAssignmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('equipment_assignment_history')
        .select(`
          *,
          project:projects(id, name),
          operator:profiles(id, full_name),
          assigned_operator:stakeholders(id, contact_person, company_name),
          assigned_by_user:profiles!equipment_assignment_history_assigned_by_fkey(id, full_name)
        `)
        .order('start_date', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignment history:', error);
        toast({
          title: "Error",
          description: "Failed to load assignment history",
          variant: "destructive"
        });
      } else {
        const processedData = processHistoryData(data || []);
        setHistory(processedData);
      }
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createHistoryRecord = async (historyData: {
    equipment_id: string;
    project_id?: string;
    operator_id?: string;
    assigned_operator_id?: string;
    start_date: string;
    end_date?: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('equipment_assignment_history')
        .insert({
          ...historyData,
          assigned_by: user.id
        })
        .select(`
          *,
          project:projects(id, name),
          operator:profiles(id, full_name),
          assigned_operator:stakeholders(id, contact_person, company_name),
          assigned_by_user:profiles!equipment_assignment_history_assigned_by_fkey(id, full_name)
        `)
        .single();

      if (!error && data) {
        const processedData = processHistoryData([data]);
        setHistory(prev => [processedData[0], ...prev]);
        toast({
          title: "Success",
          description: "Assignment history recorded"
        });
        return { data: processedData[0], error };
      }

      return { data: null, error };
    } catch (error) {
      console.error('Error creating history record:', error);
      return { error };
    }
  };

  const endCurrentAssignment = async (equipmentId: string, endDate: string) => {
    try {
      const { error } = await supabase
        .from('equipment_assignment_history')
        .update({ end_date: endDate })
        .eq('equipment_id', equipmentId)
        .is('end_date', null);

      if (!error) {
        await fetchHistory();
      }

      return { error };
    } catch (error) {
      console.error('Error ending assignment:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, equipmentId]);

  return {
    history,
    loading,
    createHistoryRecord,
    endCurrentAssignment,
    refetch: fetchHistory
  };
};
