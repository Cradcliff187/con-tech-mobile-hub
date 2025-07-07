
import React, { useState, useCallback, memo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EditTaskViewMode } from './forms/EditTaskViewMode';
import { EditTaskDialogContent } from './forms/EditTaskDialogContent';
import { ProjectContextPanel } from './ProjectContextPanel';
import { BasicStakeholderAssignment } from './BasicStakeholderAssignment';
import { useEditTaskForm } from './forms/useEditTaskForm';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode?: 'edit' | 'view';
}

export const EditTaskDialog = memo(({ open, onOpenChange, task, mode = 'edit' }: EditTaskDialogProps) => {
  const [showProjectChangeConfirm, setShowProjectChangeConfirm] = useState(false);
  const [pendingProjectChange, setPendingProjectChange] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<'edit' | 'view'>(mode);
  
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const { canAssignToProject, loading: permissionsLoading } = useProjectPermissions();
  const { projects } = useProjects();

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
    const hasAssignments = !!task.assigned_stakeholder_id || (task.assigned_stakeholder_ids && task.assigned_stakeholder_ids.length > 0);
    const hasAssignedStakeholders = task.assigned_stakeholders && task.assigned_stakeholders.length > 0;
    
    return hasAssignments || hasAssignedStakeholders;
  }, []);

  const handleProjectChange = useCallback((newProjectId: string) => {
    console.log('🔄 handleProjectChange called:', { 
      newProjectId, 
      taskProjectId: task?.project_id,
      formProjectId: formData.projectId 
    });
    
    if (!task || newProjectId === task.project_id) {
      formData.handleProjectChange(newProjectId);
      return;
    }

    // Don't validate permissions while still loading
    if (permissionsLoading) {
      console.log('⏳ Permissions still loading, allowing project change for now');
      formData.handleProjectChange(newProjectId);
      return;
    }

    // Ensure we have a valid project ID before checking permissions
    const projectIdToCheck = newProjectId || formData.projectId || task.project_id;
    
    if (!projectIdToCheck) {
      console.log('⚠️ No valid project ID available, allowing change in dev mode');
      formData.handleProjectChange(newProjectId);
      return;
    }

    if (!canAssignToProject(projectIdToCheck)) {
      toast({
        title: "Permission Error",
        description: "You don't have permission to assign tasks to this project.",
        variant: "destructive",
      });
      return;
    }

    if (checkTaskDependencies(task)) {
      setPendingProjectChange(newProjectId);
      setShowProjectChangeConfirm(true);
    } else {
      formData.handleProjectChange(newProjectId);
    }
  }, [task, formData, canAssignToProject, checkTaskDependencies, toast, permissionsLoading]);

  const handleConfirmProjectChange = useCallback(() => {
    formData.handleProjectChange(pendingProjectChange);
    setShowProjectChangeConfirm(false);
    setPendingProjectChange('');
  }, [formData, pendingProjectChange]);

  const handleCancelProjectChange = useCallback(() => {
    setShowProjectChangeConfirm(false);
    setPendingProjectChange('');
  }, []);

  const handleStakeholderSelect = (stakeholderId: string | undefined) => {
    formData.handleInputChange('assigned_stakeholder_id', stakeholderId);
    if (stakeholderId) {
      formData.handleInputChange('assigned_stakeholder_ids', []);
    }
  };

  const handleMultiStakeholderSelect = (stakeholderIds: string[]) => {
    formData.handleInputChange('assigned_stakeholder_ids', stakeholderIds);
    if (stakeholderIds.length > 0) {
      formData.handleInputChange('assigned_stakeholder_id', undefined);
    }
  };

  const handleSubmit = useCallback(async (taskData: any) => {
    if (!task || currentMode === 'view') {
      return;
    }

    // Don't validate permissions while still loading
    if (permissionsLoading) {
      console.log('⏳ Permissions still loading, deferring submit');
      return;
    }

    // Use the most reliable project ID available
    const effectiveProjectId = formData.projectId || task.project_id;
    
    console.log('📝 handleSubmit called:', { 
      formProjectId: formData.projectId,
      taskProjectId: task.project_id,
      effectiveProjectId,
      projectChanged: formData.projectId !== task.project_id
    });

    // Only check permissions if project is actually changing
    if (formData.projectId !== task.project_id && effectiveProjectId && !canAssignToProject(effectiveProjectId)) {
      const errorMessage = permissionsLoading 
        ? "Loading permissions, please wait..."
        : "You don't have permission to assign tasks to the selected project.";
      
      toast({
        title: "Permission Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    await updateOperation.execute(() => updateTask(task.id, taskData));
  }, [task, formData.projectId, updateTask, updateOperation, toast, currentMode, canAssignToProject, permissionsLoading]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      formData.resetForm();
      setCurrentMode(mode);
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

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const existingAssignments = [
    ...(task.assigned_stakeholder_id ? [task.assigned_stakeholder_id] : []),
    ...(task.assigned_stakeholder_ids || [])
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden" aria-describedby="edit-task-dialog-description">
          <DialogHeader>
            <DialogTitle>{currentMode === 'view' ? 'Task Details' : 'Edit Task'}</DialogTitle>
            <div id="edit-task-dialog-description" className="sr-only">
              {currentMode === 'view' ? 'View task details and information' : 'Edit task properties and assignments'}
            </div>
          </DialogHeader>
          
          {currentMode === 'view' ? (
            <EditTaskViewMode
              task={task}
              onClose={() => handleOpenChange(false)}
              onSwitchToEdit={handleSwitchToEdit}
            />
          ) : (
            <div className="flex gap-6 h-full">
              {/* Main Form */}
              <div className="flex-1 min-w-0">
                <ScrollArea className="h-[calc(85vh-120px)]">
                  <div className="space-y-6 pr-4">
                    <EditTaskDialogContent
                      task={task}
                      onSubmit={handleSubmit}
                      onProjectChange={handleProjectChange}
                      loading={updateOperation.loading}
                    />

                    <Separator className="my-6" />

                    {/* Stakeholder Assignment Section - Always Visible */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-slate-800">Task Assignment</h3>
                      <p className="text-sm text-slate-600">
                        Manage stakeholder assignments for this task.
                      </p>
                      <BasicStakeholderAssignment
                        projectId={formData.projectId || task.project_id}
                        requiredSkills={formData.requiredSkills || []}
                        selectedStakeholderId={formData.assigned_stakeholder_id}
                        selectedStakeholderIds={formData.assigned_stakeholder_ids || []}
                        onSingleSelect={handleStakeholderSelect}
                        onMultiSelect={handleMultiStakeholderSelect}
                        multiSelectMode={true}
                        existingAssignments={existingAssignments}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Context Sidebar */}
              <div className="w-80 flex-shrink-0">
                <ProjectContextPanel project={selectedProject || null} />
              </div>
            </div>
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
