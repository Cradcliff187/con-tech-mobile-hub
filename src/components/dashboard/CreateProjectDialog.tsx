
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStakeholders } from '@/hooks/useStakeholders';
import { CreateStakeholderDialog } from '@/components/stakeholders/CreateStakeholderDialog';
import { ProjectFormFields } from './forms/ProjectFormFields';
import { useProjectForm } from './hooks/useProjectForm';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [showCreateClient, setShowCreateClient] = useState(false);
  
  const { stakeholders, refetch: refetchStakeholders } = useStakeholders();
  const {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  } = useProjectForm({
    onClose: () => onOpenChange(false)
  });

  // Filter stakeholders to show only clients
  const clients = stakeholders.filter(s => s.stakeholder_type === 'client');

  const handleClientCreated = () => {
    refetchStakeholders();
    setShowCreateClient(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <ProjectFormFields 
              formData={formData}
              onInputChange={handleInputChange}
              clients={clients}
              onCreateClient={() => setShowCreateClient(true)}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreateStakeholderDialog 
        open={showCreateClient} 
        onOpenChange={setShowCreateClient}
        defaultType="client"
        onSuccess={handleClientCreated}
      />
    </>
  );
};
