
import { useState } from 'react';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { Stakeholder } from '@/hooks/useStakeholders';
import { useTasks } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAssignmentForm } from '@/hooks/useAssignmentForm';
import { ProjectSelectionField } from './assignment/ProjectSelectionField';
import { TaskSelectionField } from './assignment/TaskSelectionField';
import { AssignmentFormFields } from './assignment/AssignmentFormFields';

interface AssignStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
}

export const AssignStakeholderDialog = ({ open, onOpenChange, stakeholder }: AssignStakeholderDialogProps) => {
  const { createAssignment } = useStakeholderAssignments();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const { formData, setFormData, selectedProject, projects, resetForm } = useAssignmentForm(stakeholder, open);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stakeholder || !formData.project_id) {
      toast({
        title: "Validation Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const assignmentData = {
      stakeholder_id: stakeholder.id,
      project_id: formData.project_id,
      task_id: formData.task_id !== 'none' ? formData.task_id : undefined,
      role: formData.role || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      notes: formData.notes || undefined,
      status: 'assigned'
    };

    const { error } = await createAssignment(assignmentData);
    
    if (!error) {
      resetForm();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Stakeholder assigned successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId, task_id: 'none' }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableTasks = tasks.filter(t => t.project_id === formData.project_id);

  if (!stakeholder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign {stakeholder.company_name} to Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProjectSelectionField
            value={formData.project_id}
            onChange={handleProjectChange}
            projects={projects}
            selectedProject={selectedProject}
            stakeholder={stakeholder}
          />

          <TaskSelectionField
            value={formData.task_id}
            onChange={(value) => handleFieldChange('task_id', value)}
            tasks={availableTasks}
            stakeholder={stakeholder}
            projectSelected={!!selectedProject}
          />

          <AssignmentFormFields
            formData={formData}
            onChange={handleFieldChange}
            stakeholder={stakeholder}
          />

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.project_id} 
              className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Assigning...' : 'Assign to Project'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
