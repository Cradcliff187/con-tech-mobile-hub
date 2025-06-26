
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
import { useEditTaskForm } from './forms/useEditTaskForm';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';

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
    if (!task || newProjectId === task.project_id) {
      formData.handleProjectChange(newProjectId);
      return;
    }

    if (!canAssignToProject(newProjectId)) {
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

  const handleSubmit = useCallback(async (taskData: any) => {
    if (!task || currentMode === 'view') {
      return;
    }

    if (formData.projectId !== task.project_id && !canAssignToProject(formData.projectId)) {
      toast({
        title: "Permission Error",
        description: "You don't have permission to assign tasks to the selected project.",
        variant: "destructive",
      });
      return;
    }

    await updateOperation.execute(() => updateTask(task.id, taskData));
  }, [task, formData.projectId, updateTask, updateOperation, toast, currentMode, canAssignToProject]);

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
            <EditTaskDialogContent
              task={task}
              onSubmit={handleSubmit}
              onProjectChange={handleProjectChange}
              loading={updateOperation.loading}
            />
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
