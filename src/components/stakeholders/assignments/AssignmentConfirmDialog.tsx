
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AssignmentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  newStatus: string;
  currentStatus: string;
}

export const AssignmentConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  newStatus,
  currentStatus
}: AssignmentConfirmDialogProps) => {
  const getStatusConfirmationMessage = (newStatus: string, currentStatus: string) => {
    if (newStatus === 'cancelled') {
      return "Are you sure you want to cancel this assignment? This action will mark the assignment as cancelled.";
    }
    if (currentStatus === 'completed' && newStatus !== 'completed') {
      return "This assignment is currently marked as completed. Are you sure you want to change its status?";
    }
    return "Are you sure you want to change the status of this assignment?";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
          <AlertDialogDescription>
            {getStatusConfirmationMessage(newStatus, currentStatus)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
