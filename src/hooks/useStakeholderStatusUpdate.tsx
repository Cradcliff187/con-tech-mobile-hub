
import { useState, useCallback } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { Stakeholder } from '@/hooks/useStakeholders';

type StakeholderStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export const useStakeholderStatusUpdate = () => {
  const [updatingStakeholders, setUpdatingStakeholders] = useState<Set<string>>(new Set());
  const { updateStakeholder } = useStakeholders();
  const { toast } = useToast();

  const updateStakeholderStatus = useCallback(async (
    stakeholder: Stakeholder, 
    newStatus: StakeholderStatus,
    showConfirmation: boolean = false
  ) => {
    const stakeholderId = stakeholder.id;

    // Check if confirmation is needed for sensitive status changes
    if (showConfirmation && (newStatus === 'suspended' || newStatus === 'inactive')) {
      const confirmMessage = newStatus === 'suspended' 
        ? 'This will suspend the stakeholder and may affect active assignments.'
        : 'This will mark the stakeholder as inactive.';
      
      if (!window.confirm(`Are you sure you want to change status to ${newStatus}? ${confirmMessage}`)) {
        return false;
      }
    }

    // Add to updating set
    setUpdatingStakeholders(prev => new Set([...prev, stakeholderId]));

    try {
      const { error } = await updateStakeholder(stakeholderId, { status: newStatus });

      if (error) {
        throw error;
      }

      // Success toast
      toast({
        title: "Status updated",
        description: `${stakeholder.company_name || stakeholder.contact_person} status changed to ${newStatus}`
      });

      return true;
    } catch (error: any) {
      console.error('Failed to update stakeholder status:', error);
      toast({
        title: "Error",
        description: "Failed to update stakeholder status",
        variant: "destructive"
      });
      return false;
    } finally {
      // Remove from updating set
      setUpdatingStakeholders(prev => {
        const newSet = new Set(prev);
        newSet.delete(stakeholderId);
        return newSet;
      });
    }
  }, [updateStakeholder, toast]);

  const isUpdating = useCallback((stakeholderId: string) => {
    return updatingStakeholders.has(stakeholderId);
  }, [updatingStakeholders]);

  return {
    updateStakeholderStatus,
    isUpdating
  };
};
