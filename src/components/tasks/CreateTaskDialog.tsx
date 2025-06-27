
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useCreateTaskForm } from './hooks/useCreateTaskForm';
import { CreateTaskFormFields } from './forms/CreateTaskFormFields';
import { ProjectContextPanel } from './ProjectContextPanel';
import { BasicStakeholderAssignment } from './BasicStakeholderAssignment';
import { useProjects } from '@/hooks/useProjects';
import { Separator } from '@/components/ui/separator';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  
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
          <DialogTitle>Create New Task</DialogTitle>
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

                {/* Basic Assignment Panel Toggle */}
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAssignmentPanel(!showAssignmentPanel)}
                    className="w-full mb-4"
                  >
                    {showAssignmentPanel ? 'Hide' : 'Show'} Assignment Panel
                  </Button>

                  {showAssignmentPanel && formData.project_id && (
                    <BasicStakeholderAssignment
                      projectId={formData.project_id}
                      requiredSkills={formData.required_skills || []}
                      selectedStakeholderId={formData.assigned_stakeholder_id}
                      selectedStakeholderIds={formData.assigned_stakeholder_ids || []}
                      onSingleSelect={handleStakeholderSelect}
                      onMultiSelect={handleMultiStakeholderSelect}
                      multiSelectMode={false}
                    />
                  )}
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
