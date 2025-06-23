import { useState, useEffect } from 'react';
import { 
  UnifiedLifecycleStatus,
  StatusTransition,
  ProjectWithUnifiedStatus
} from '@/types/unified-lifecycle';
import { 
  getUnifiedLifecycleStatus,
  getAvailableTransitions,
  validateStatusTransition,
  updateProjectStatus
} from '@/utils/unified-lifecycle-utils';

interface UseUnifiedLifecycleStatusProps {
  project: ProjectWithUnifiedStatus;
  onStatusChange?: (newStatus: UnifiedLifecycleStatus) => void;
}

export const useUnifiedLifecycleStatus = ({ 
  project, 
  onStatusChange 
}: UseUnifiedLifecycleStatusProps) => {
  const [availableTransitions, setAvailableTransitions] = useState<StatusTransition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = getUnifiedLifecycleStatus(project);

  // Load available transitions when status changes
  useEffect(() => {
    const loadTransitions = async () => {
      setIsLoading(true);
      try {
        const transitions = await getAvailableTransitions(currentStatus);
        setAvailableTransitions(transitions);
      } catch (error) {
        console.error('Error loading transitions:', error);
        setAvailableTransitions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransitions();
  }, [currentStatus]);

  const validateTransition = async (newStatus: UnifiedLifecycleStatus) => {
    return await validateStatusTransition(project.id, newStatus);
  };

  const changeStatus = async (newStatus: UnifiedLifecycleStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateProjectStatus(project.id, newStatus);
      
      if (result.success) {
        onStatusChange?.(newStatus);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error changing status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const canTransitionTo = (targetStatus: UnifiedLifecycleStatus): boolean => {
    return availableTransitions.some(t => t.to_status === targetStatus);
  };

  const getTransitionDetails = (targetStatus: UnifiedLifecycleStatus): StatusTransition | null => {
    return availableTransitions.find(t => t.to_status === targetStatus) || null;
  };

  return {
    currentStatus,
    availableTransitions,
    isLoading,
    isUpdating,
    validateTransition,
    changeStatus,
    canTransitionTo,
    getTransitionDetails
  };
};
