
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateTaskForm } from './hooks/useCreateTaskForm';
import { CreateTaskFormFields } from './forms/CreateTaskFormFields';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  const {
    formData,
    newSkill,
    setNewSkill,
    errors,
    loading,
    projects,
    selectedProject,
    workers,
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSubmit,
    getFieldError
  } = useCreateTaskForm({
    onSuccess: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <CreateTaskFormFields
            formData={formData}
            projects={projects}
            selectedProject={selectedProject}
            workers={workers}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            errors={errors}
            onInputChange={handleInputChange}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            getFieldError={getFieldError}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.project_id}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
