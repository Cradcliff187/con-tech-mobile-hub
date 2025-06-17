
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ResolutionOptionsSelector } from './ResolutionOptionsSelector';
import { RescheduleForm } from './RescheduleForm';
import { AlternativeEquipmentForm } from './AlternativeEquipmentForm';
import { ReassignProjectForm } from './ReassignProjectForm';
import { useEquipmentConflictResolution } from './useEquipmentConflictResolution';
import { Wrench } from 'lucide-react';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

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
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Resolve Equipment Conflict"
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={20} />
          <span className="font-medium">Resolve Equipment Conflict</span>
        </div>

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

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          <TouchFriendlyButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton
            onClick={() => handleResolve({})}
            disabled={isSubmitting || !selectedOption}
            className="order-1 sm:order-2"
          >
            {isSubmitting ? 'Resolving...' : 'Resolve Conflict'}
          </TouchFriendlyButton>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
