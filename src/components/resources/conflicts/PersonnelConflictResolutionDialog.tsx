
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { PersonnelResolutionOptions } from './PersonnelResolutionOptions';
import { ReassignmentForm, ExtensionForm, ReduceHoursForm } from './PersonnelResolutionForms';
import { usePersonnelConflictResolution } from './usePersonnelConflictResolution';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface PersonnelConflictResolutionDialogProps {
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

export const PersonnelConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolved
}: PersonnelConflictResolutionDialogProps) => {
  const {
    selectedOption,
    setSelectedOption,
    isSubmitting,
    newHours,
    setNewHours,
    extensionDays,
    setExtensionDays,
    reassignmentNotes,
    setReassignmentNotes,
    handleResolve
  } = usePersonnelConflictResolution(conflict, onResolved, () => onOpenChange(false));

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Resolve Personnel Conflict"
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} />
          <span className="font-medium">Resolve Personnel Conflict</span>
        </div>

        <div>
          <Label className="text-sm font-medium">Conflict Details</Label>
          <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
        </div>

        <PersonnelResolutionOptions
          selectedOption={selectedOption}
          onOptionChange={setSelectedOption}
        />

        {selectedOption === 'reassign' && (
          <ReassignmentForm
            notes={reassignmentNotes}
            onNotesChange={setReassignmentNotes}
          />
        )}

        {selectedOption === 'extend' && (
          <ExtensionForm
            days={extensionDays}
            onDaysChange={setExtensionDays}
          />
        )}

        {selectedOption === 'reduce' && (
          <ReduceHoursForm
            hours={newHours}
            onHoursChange={setNewHours}
          />
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
            onClick={handleResolve}
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
