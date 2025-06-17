
import { useState } from 'react';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { useToast } from '@/hooks/use-toast';

export const useAssignmentStatusUpdates = () => {
  const { updateAssignment, refetch } = useStakeholderAssignments();
  const { toast } = useToast();
  const [updatingAssignments, setUpdatingAssignments] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    assignmentId: string;
    newStatus: string;
    currentStatus: string;
  }>({ open: false, assignmentId: '', newStatus: '', currentStatus: '' });

  const handleStatusChange = (assignmentId: string, newStatus: string, currentStatus: string) => {
    // Show confirmation for sensitive status changes
    if (newStatus === 'cancelled' || (currentStatus === 'completed' && newStatus !== 'completed')) {
      setConfirmDialog({
        open: true,
        assignmentId,
        newStatus,
        currentStatus
      });
    } else {
      performStatusUpdate(assignmentId, newStatus);
    }
  };

  const performStatusUpdate = async (assignmentId: string, newStatus: string) => {
    setUpdatingAssignments(prev => new Set([...prev, assignmentId]));
    
    const { error } = await updateAssignment(assignmentId, { status: newStatus });
    
    if (!error) {
      toast({
        title: "Success",
        description: "Assignment status updated successfully"
      });
      // Refresh the assignments list
      await refetch();
    } else {
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
    
    setUpdatingAssignments(prev => {
      const newSet = new Set(prev);
      newSet.delete(assignmentId);
      return newSet;
    });
  };

  const handleConfirmStatusChange = () => {
    performStatusUpdate(confirmDialog.assignmentId, confirmDialog.newStatus);
    setConfirmDialog({ open: false, assignmentId: '', newStatus: '', currentStatus: '' });
  };

  return {
    updatingAssignments,
    confirmDialog,
    setConfirmDialog,
    handleStatusChange,
    handleConfirmStatusChange
  };
};
