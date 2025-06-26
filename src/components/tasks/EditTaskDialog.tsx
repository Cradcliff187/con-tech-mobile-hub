import React, { useState, useCallback, memo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Paperclip } from 'lucide-react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EditTaskBasicFields } from './forms/EditTaskBasicFields';
import { EditTaskAdvancedFields } from './forms/EditTaskAdvancedFields';
import { EditTaskViewMode } from './forms/EditTaskViewMode';
import { TaskDocumentAttachments } from './TaskDocumentAttachments';
import { useEditTaskForm } from './forms/useEditTaskForm';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode?: 'edit' | 'view';
}

export const EditTaskDialog = memo(({ open, onOpenChange, task, mode = 'edit' }: EditTaskDialogProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showProjectChangeConfirm, setShowProjectChangeConfirm] = useState(false);
  const [pendingProjectChange, setPendingProjectChange] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<'edit' | 'view'>(mode);
  
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const { canAssignToProject, loading: permissionsLoading } = useProjectPermissions();

  const formData = useEditTaskForm({ task, open });

  // Update current mode when prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const updateOperation = useAsyncOperation({
    successMessage: "Task updated successfully",
    errorMessage: "Failed to update task",
    onSuccess: () => {
      onOpenChange(false);
      formData.resetForm();
    }
  });

  const checkTaskDependencies = useCallback((task: Task): boolean => {
    // Check if task has relationships that might be affected by project change
    const hasAssignments = !!task.assigned_stakeholder_id || (task.assigned_stakeholder_ids && task.assigned_stakeholder_ids.length > 0);
    const hasAssignedStakeholders = task.assigned_stakeholders && task.assigned_stakeholders.length > 0;
    
    return hasAssignments || hasAssignedStakeholders;
  }, []);

  const handleProjectChange = useCallback((newProjectId: string) => {
    if (!task || newProjectId === task.project_id) {
      formData.handleProjectChange(newProjectId);
      return;
    }

    // Check permissions first
    if (!canAssignToProject(newProjectId)) {
      toast({
        title: "Permission Error",
        description: "You don't have permission to assign tasks to this project.",
        variant: "destructive",
      });
      return;
    }

    // Check if task has dependencies that require confirmation
    if (checkTaskDependencies(task)) {
      setPendingProjectChange(newProjectId);
      setShowProjectChangeConfirm(true);
    } else {
      formData.handleProjectChange(newProjectId);
    }
  }, [task, formData, canAssignToProject, checkTaskDependencies, toast]);

  const handleConfirmProjectChange = useCallback(() => {
    formData.handleProjectChange(pendingProjectChange);
    setShowProjectChangeConfirm(false);
    setPendingProjectChange('');
  }, [formData, pendingProjectChange]);

  const handleCancelProjectChange = useCallback(() => {
    setShowProjectChangeConfirm(false);
    setPendingProjectChange('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || currentMode === 'view') {
      return;
    }

    // Use unified validation
    const validation = formData.validateForm();
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    // Final permission check for project assignment
    if (formData.projectId !== task.project_id && !canAssignToProject(formData.projectId)) {
      toast({
        title: "Permission Error",
        description: "You don't have permission to assign tasks to the selected project.",
        variant: "destructive",
      });
      return;
    }

    await updateOperation.execute(() => 
      updateTask(task.id, formData.getFormData())
    );
  }, [task, formData, updateTask, updateOperation, toast, currentMode, canAssignToProject]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      formData.resetForm();
      setCurrentMode(mode); // Reset mode when closing
    }
    onOpenChange(newOpen);
  }, [updateOperation.loading, formData, onOpenChange, mode]);

  const handleSwitchToEdit = useCallback(() => {
    setCurrentMode('edit');
  }, []);

  if (permissionsLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentMode === 'view' ? 'Task Details' : 'Edit Task'}</DialogTitle>
          </DialogHeader>
          
          {currentMode === 'view' ? (
            <EditTaskViewMode
              task={task}
              onClose={() => handleOpenChange(false)}
              onSwitchToEdit={handleSwitchToEdit}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Fields */}
              <EditTaskBasicFields
                title={formData.title}
                setTitle={formData.setTitle}
                description={formData.description}
                setDescription={formData.setDescription}
                status={formData.status}
                onStatusChange={formData.handleStatusChange}
                priority={formData.priority}
                setPriority={formData.setPriority}
                dueDate={formData.dueDate}
                setDueDate={formData.setDueDate}
                projectId={formData.projectId}
                onProjectChange={handleProjectChange}
                progress={formData.progress}
                setProgress={formData.setProgress}
                disabled={updateOperation.loading}
                errors={formData.errors}
                getFieldError={formData.getFieldError}
              />

              {/* Advanced Fields */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
                  >
                    {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Advanced Fields
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  <EditTaskAdvancedFields
                    taskType={formData.taskType}
                    setTaskType={formData.setTaskType}
                    category={formData.category}
                    setCategory={formData.setCategory}
                    estimatedHours={formData.estimatedHours}
                    setEstimatedHours={formData.setEstimatedHours}
                    actualHours={formData.actualHours}
                    setActualHours={formData.setActualHours}
                    startDate={formData.startDate}
                    setStartDate={formData.setStartDate}
                    requiredSkills={formData.requiredSkills}
                    newSkill={formData.newSkill}
                    setNewSkill={formData.setNewSkill}
                    onAddSkill={formData.handleAddSkill}
                    onRemoveSkill={formData.handleRemoveSkill}
                    punchListCategory={formData.punchListCategory}
                    setPunchListCategory={formData.setPunchListCategory}
                    disabled={updateOperation.loading}
                    errors={formData.errors}
                    getFieldError={formData.getFieldError}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Document Attachments */}
              <Collapsible open={showAttachments} onOpenChange={setShowAttachments}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
                  >
                    {showAttachments ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Paperclip className="h-4 w-4" />
                    Document Attachments
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <TaskDocumentAttachments task={task} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)}
                  disabled={updateOperation.loading}
                  className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateOperation.loading || !formData.title.trim() || formData.hasErrors()}
                  className="bg-orange-600 hover:bg-orange-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-300"
                >
                  {updateOperation.loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showProjectChangeConfirm}
        onOpenChange={setShowProjectChangeConfirm}
        title="Confirm Project Change"
        description="This task has existing assignments or dependencies. Changing the project may affect these relationships. Do you want to continue?"
        confirmText="Change Project"
        cancelText="Keep Current Project"
        onConfirm={handleConfirmProjectChange}
        variant="default"
      />
    </>
  );
});

EditTaskDialog.displayName = 'EditTaskDialog';
