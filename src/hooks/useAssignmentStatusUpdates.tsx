
import { useState } from 'react';
import { useStakeholderAssignments } from './useStakeholderAssignments';

interface ConfirmDialogState {
  open: boolean;
  assignmentId: string;
  newStatus: string;
  currentStatus: string;
}

export const useAssignmentStatusUpdates = () => {
  const { updateAssignment } = useStakeholderAssignments();
  const [updatingAssignments, setUpdatingAssignments] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    assignmentId: '',
    newStatus: '',
    currentStatus: ''
  });

  const handleStatusChange = (assignmentId: string, newStatus: string, currentStatus: string) => {
    setConfirmDialog({
      open: true,
      assignmentId,
      newStatus,
      currentStatus
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
        newStatus: '',
        currentStatus: ''
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
