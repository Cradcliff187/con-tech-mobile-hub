
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTaskForm } from '@/components/tasks/hooks/useCreateTaskForm';
import { CreateTaskFormFields } from '@/components/tasks/forms/CreateTaskFormFields';
import { BasicStakeholderAssignment } from '@/components/tasks/BasicStakeholderAssignment';
import { ProjectContextPanel } from '@/components/tasks/ProjectContextPanel';
import { useProjects } from '@/hooks/useProjects';
import { Separator } from '@/components/ui/separator';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  category?: string;
  parentTaskId?: string;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  projectId, 
  category, 
  parentTaskId 
}: AddTaskDialogProps) => {
  const { projects } = useProjects();
  
  const {
    formData,
    newSkill,
    setNewSkill,
    errors,
    loading,
    selectedProject,
    workers,
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSubmit,
    getFieldError
  } = useCreateTaskForm({
    onSuccess: () => onOpenChange(false),
    defaultProjectId: projectId,
    defaultCategory: category
  });

  const handleStakeholderSelect = (stakeholderId: string | undefined) => {
    handleInputChange('assigned_stakeholder_id', stakeholderId);
    if (stakeholderId) {
      handleInputChange('assigned_stakeholder_ids', []);
    }
  };

  const handleMultiStakeholderSelect = (stakeholderIds: string[]) => {
    handleInputChange('assigned_stakeholder_ids', stakeholderIds);
    if (stakeholderIds.length > 0) {
      handleInputChange('assigned_stakeholder_id', undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Add New Task
            {category && <span className="text-orange-600"> to {category}</span>}
          </DialogTitle>
          <DialogDescription>
            Create a new task {category ? `in the ${category} category` : 'for this project'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 h-full">
          {/* Main Form */}
          <div className="flex-1 min-w-0">
            <ScrollArea className="h-[calc(85vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-4 pr-4">
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

                <Separator className="my-6" />

                {/* Stakeholder Assignment Section - Always Visible */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800">Task Assignment</h3>
                  <BasicStakeholderAssignment
                    projectId={projectId}
                    requiredSkills={formData.required_skills || []}
                    selectedStakeholderId={formData.assigned_stakeholder_id}
                    selectedStakeholderIds={formData.assigned_stakeholder_ids || []}
                    onSingleSelect={handleStakeholderSelect}
                    onMultiSelect={handleMultiStakeholderSelect}
                    multiSelectMode={false}
                  />
                </div>
              </form>
            </ScrollArea>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !formData.project_id}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>

          {/* Context Sidebar */}
          <div className="w-80 flex-shrink-0">
            <ProjectContextPanel project={selectedProject || null} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
