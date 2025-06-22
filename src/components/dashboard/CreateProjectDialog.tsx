
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useCreateProjectForm } from './hooks/useCreateProjectForm';
import { CreateProjectFormFields } from './forms/CreateProjectFormFields';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
}

export const CreateProjectDialog = ({ 
  open, 
  onOpenChange, 
  defaultClientId 
}: CreateProjectDialogProps) => {
  const { stakeholders } = useStakeholders();
  const clients = stakeholders.filter(s => s.stakeholder_type === 'client');

  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit
  } = useCreateProjectForm({
    defaultClientId,
    onSuccess: () => onOpenChange(false)
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Project"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <CreateProjectFormFields
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || clients.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
