
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ResolutionOptionsSelector } from './ResolutionOptionsSelector';
import { RescheduleForm } from './RescheduleForm';
import { AlternativeEquipmentForm } from './AlternativeEquipmentForm';
import { ReassignProjectForm } from './ReassignProjectForm';
import { useEquipmentConflictResolution } from './useEquipmentConflictResolution';
import { Wrench } from 'lucide-react';

interface EquipmentConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: {
    id: string;
    title: string;
    description: string;
    affectedProjects: string[];
  };
  onResolved: () => void;
}

export const EquipmentConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolved
}: EquipmentConflictResolutionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { resolveConflict } = useEquipmentConflictResolution();

  const handleResolve = async (resolutionData: any) => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select a resolution option",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await resolveConflict(selectedOption, resolutionData, conflict);

      toast({
        title: "Conflict Resolved",
        description: "Equipment double-booking has been resolved"
      });

      onResolved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} />
            Resolve Equipment Conflict
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium">Conflict Details</span>
            <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
          </div>

          <ResolutionOptionsSelector
            selectedOption={selectedOption}
            onSelectionChange={setSelectedOption}
          />

          {selectedOption === 'reschedule' && (
            <RescheduleForm onSubmit={handleResolve} isSubmitting={isSubmitting} />
          )}

          {selectedOption === 'alternative' && (
            <AlternativeEquipmentForm onSubmit={handleResolve} isSubmitting={isSubmitting} />
          )}

          {selectedOption === 'reassign' && (
            <ReassignProjectForm onSubmit={handleResolve} isSubmitting={isSubmitting} />
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleResolve({})}
              disabled={isSubmitting || !selectedOption}
            >
              {isSubmitting ? 'Resolving...' : 'Resolve Conflict'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
