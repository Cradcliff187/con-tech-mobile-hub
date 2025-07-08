
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStakeholders } from '@/hooks/useStakeholders';

interface WorkloadData {
  stakeholder_id: string;
  total_allocated_hours: number;
  max_available_hours: number;
  utilization_percentage: number;
  is_overallocated: boolean;
  project_assignments: Array<{
    project_id: string;
    project_name: string;
    role: string;
    daily_hours: number;
  }>;
}

interface UseStakeholderWorkloadProps {
  startDate?: Date;
  endDate?: Date;
  stakeholderIds?: string[];
}

export const useStakeholderWorkload = ({
  startDate = new Date(),
  endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  stakeholderIds
}: UseStakeholderWorkloadProps = {}) => {
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { stakeholders } = useStakeholders();

  // Memoize date strings to prevent infinite loops
  const startDateString = useMemo(() => startDate.toISOString().split('T')[0], [startDate.getTime()]);
  const endDateString = useMemo(() => endDate.toISOString().split('T')[0], [endDate.getTime()]);
  const stakeholderIdsString = useMemo(() => 
    stakeholderIds ? stakeholderIds.sort().join(',') : '', 
    [stakeholderIds]
  );

  const fetchWorkloadData = useCallback(async () => {
    let isCancelled = false;
    
    try {
      setLoading(true);
      setError(null);

      // Get workload data using the database function
      const { data, error: workloadError } = await supabase
        .rpc('calculate_employee_utilization', {
          start_date: startDateString,
          end_date: endDateString
        });

      if (isCancelled) return;

      if (workloadError) {
        throw workloadError;
      }

      // Process and aggregate the data by stakeholder
      const processedData = processWorkloadData(data || []);
      
      // Filter by stakeholder IDs if provided
      const filteredData = stakeholderIds 
        ? processedData.filter(item => stakeholderIds.includes(item.stakeholder_id))
        : processedData;

      if (!isCancelled) {
        setWorkloadData(filteredData);
      }
    } catch (err) {
      if (!isCancelled) {
        console.error('Error fetching workload data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch workload data');
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return isCancelled;
  }, [startDateString, endDateString, stakeholderIdsString]);

  const processWorkloadData = (rawData: any[]): WorkloadData[] => {
    const stakeholderMap = new Map<string, WorkloadData>();

    rawData.forEach(item => {
      const stakeholderId = item.stakeholder_id;
      
      if (!stakeholderMap.has(stakeholderId)) {
        stakeholderMap.set(stakeholderId, {
          stakeholder_id: stakeholderId,
          total_allocated_hours: 0,
          max_available_hours: 0,
          utilization_percentage: 0,
          is_overallocated: false,
          project_assignments: []
        });
      }

      const stakeholderData = stakeholderMap.get(stakeholderId)!;
      stakeholderData.total_allocated_hours += item.total_allocated_hours || 0;
      stakeholderData.max_available_hours += item.max_available_hours || 8;
      
      if (item.project_assignments) {
        stakeholderData.project_assignments.push(...(item.project_assignments || []));
      }
    });

    // Calculate final utilization percentages
    stakeholderMap.forEach(data => {
      if (data.max_available_hours > 0) {
        data.utilization_percentage = (data.total_allocated_hours / data.max_available_hours) * 100;
        data.is_overallocated = data.utilization_percentage > 100;
      }
    });

    return Array.from(stakeholderMap.values());
  };

  // Define availability status helper function first
  const getAvailabilityStatus = (utilization: number) => {
    if (utilization >= 100) return 'overallocated';
    if (utilization >= 80) return 'nearly_full';
    if (utilization >= 50) return 'moderate';
    return 'available';
  };

  useEffect(() => {
    let isCancelled = false;
    
    const loadData = async () => {
      await fetchWorkloadData();
    };
    
    loadData();
    
    return () => {
      isCancelled = true;
    };
  }, [fetchWorkloadData]);

  // Enhanced workload data with stakeholder information
  const enhancedWorkloadData = useMemo(() => {
    return workloadData.map(workload => {
      const stakeholder = stakeholders.find(s => s.id === workload.stakeholder_id);
      return {
        ...workload,
        stakeholder,
        availabilityStatus: getAvailabilityStatus(workload.utilization_percentage),
        capacityHours: Math.max(0, workload.max_available_hours - workload.total_allocated_hours)
      };
    });
  }, [workloadData, stakeholders]);

  const getStakeholderWorkload = (stakeholderId: string) => {
    return enhancedWorkloadData.find(w => w.stakeholder_id === stakeholderId);
  };

  return {
    workloadData: enhancedWorkloadData,
    loading,
    error,
    refetch: fetchWorkloadData,
    getStakeholderWorkload
  };
};
