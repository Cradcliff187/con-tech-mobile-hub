
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { PersonnelResolutionOptions } from './PersonnelResolutionOptions';
import { ReassignmentForm, ExtensionForm, ReduceHoursForm } from './PersonnelResolutionForms';
import { usePersonnelConflictResolution } from './usePersonnelConflictResolution';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Resolve Personnel Conflict
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
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
