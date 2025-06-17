
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const title = "Confirm Phase Transition";
  const description = `Are you sure you want to advance the project from ${currentPhase.replace('_', ' ')} to ${targetPhase.replace('_', ' ')} phase?`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <TouchFriendlyButton
              onClick={onConfirm}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Transition
            </TouchFriendlyButton>
            <TouchFriendlyButton
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </TouchFriendlyButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Transition
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
