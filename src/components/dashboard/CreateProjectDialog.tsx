
import { useState } from 'react';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useCreateProjectForm } from './hooks/useCreateProjectForm';
import { CreateProjectFormFields } from './forms/CreateProjectFormFields';
import { CreateStakeholderDialog } from '@/components/stakeholders/CreateStakeholderDialog';

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
  const [showCreateClient, setShowCreateClient] = useState(false);
  const { stakeholders, refetch } = useStakeholders();
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

  const handleCreateClient = () => {
    setShowCreateClient(true);
  };

  const handleClientCreated = () => {
    setShowCreateClient(false);
    refetch(); // Refresh the clients list
  };

  return (
    <>
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
            disabled={isSubmitting}
            clients={clients}
            onCreateClient={handleCreateClient}
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
              disabled={isSubmitting || !formData.client_id}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <CreateStakeholderDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        defaultType="client"
        onSuccess={handleClientCreated}
      />
    </>
  );
};
