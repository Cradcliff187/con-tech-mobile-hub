
import { useState } from 'react';
import { useStakeholderAssignments } from './useStakeholderAssignments';

type AssignmentStatus = 'assigned' | 'active' | 'completed' | 'cancelled' | 'on-hold';

interface ConfirmDialogState {
  open: boolean;
  assignmentId: string;
  newStatus: AssignmentStatus;
  currentStatus: AssignmentStatus;
}

export const useAssignmentStatusUpdates = () => {
  const { updateAssignment } = useStakeholderAssignments();
  const [updatingAssignments, setUpdatingAssignments] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    assignmentId: '',
    newStatus: 'assigned',
    currentStatus: 'assigned'
  });

  const handleStatusChange = (assignmentId: string, newStatus: string, currentStatus: string) => {
    setConfirmDialog({
      open: true,
      assignmentId,
      newStatus: newStatus as AssignmentStatus,
      currentStatus: currentStatus as AssignmentStatus
    });
  };

  const handleConfirmStatusChange = async () => {
    const { assignmentId, newStatus } = confirmDialog;
    
    setUpdatingAssignments(prev => new Set([...prev, assignmentId]));
    
    try {
      await updateAssignment(assignmentId, { status: newStatus });
    } finally {
      setUpdatingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
      setConfirmDialog({
        open: false,
        assignmentId: '',
        newStatus: 'assigned',
        currentStatus: 'assigned'
      });
    }
  };

  return {
    updatingAssignments,
    confirmDialog,
    setConfirmDialog,
    handleStatusChange,
    handleConfirmStatusChange
  };
};
