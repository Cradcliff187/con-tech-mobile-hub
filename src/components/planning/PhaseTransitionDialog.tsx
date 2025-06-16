
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PhaseTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhase: string;
  targetPhase: string;
  isUpdating: boolean;
  onConfirm: () => void;
}

export const PhaseTransitionDialog = ({
  open,
  onOpenChange,
  currentPhase,
  targetPhase,
  isUpdating,
  onConfirm
}: PhaseTransitionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Phase Transition</DialogTitle>
          <DialogDescription>
            Are you sure you want to advance the project from{' '}
            <span className="font-medium">{currentPhase.replace('_', ' ')}</span> to{' '}
            <span className="font-medium">{targetPhase.replace('_', ' ')}</span> phase?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Transition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
