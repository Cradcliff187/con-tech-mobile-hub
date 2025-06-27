
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useCreateTaskForm } from './hooks/useCreateTaskForm';
import { CreateTaskFormFields } from './forms/CreateTaskFormFields';
import { ProjectContextPanel } from './ProjectContextPanel';
import { SmartStakeholderAssignment } from './SmartStakeholderAssignment';
import { useProjects } from '@/hooks/useProjects';
import { Separator } from '@/components/ui/separator';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  const [showAdvancedAssignment, setShowAdvancedAssignment] = useState(false);
  
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

  const handleStakeholderSelect = (stakeholderIds: string[]) => {
    if (stakeholderIds.length === 1) {
      handleInputChange('assigned_stakeholder_id', stakeholderIds[0]);
      handleInputChange('assigned_stakeholder_ids', []);
    } else if (stakeholderIds.length > 1) {
      handleInputChange('assigned_stakeholder_ids', stakeholderIds);
      handleInputChange('assigned_stakeholder_id', undefined);
    } else {
      handleInputChange('assigned_stakeholder_id', undefined);
      handleInputChange('assigned_stakeholder_ids', []);
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

                {/* Smart Assignment Toggle */}
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdvancedAssignment(!showAdvancedAssignment)}
                    className="w-full mb-4"
                  >
                    {showAdvancedAssignment ? 'Hide' : 'Show'} Smart Assignment Suggestions
                  </Button>

                  {showAdvancedAssignment && formData.project_id && (
                    <SmartStakeholderAssignment
                      projectId={formData.project_id}
                      requiredSkills={formData.required_skills || []}
                      selectedStakeholderIds={[
                        ...(formData.assigned_stakeholder_id ? [formData.assigned_stakeholder_id] : []),
                        ...(formData.assigned_stakeholder_ids || [])
                      ]}
                      onSelectionChange={handleStakeholderSelect}
                      taskPriority={formData.priority || 'medium'}
                      estimatedHours={formData.estimated_hours}
                      dueDate={formData.due_date}
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
