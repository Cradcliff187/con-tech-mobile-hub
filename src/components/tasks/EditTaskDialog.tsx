
import React, { useState, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EditTaskBasicFields } from './forms/EditTaskBasicFields';
import { EditTaskAdvancedFields } from './forms/EditTaskAdvancedFields';
import { EditTaskViewMode } from './forms/EditTaskViewMode';
import { useEditTaskForm } from './forms/useEditTaskForm';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode?: 'edit' | 'view';
}

export const EditTaskDialog = memo(({ open, onOpenChange, task, mode = 'edit' }: EditTaskDialogProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const isViewMode = mode === 'view';

  const formData = useEditTaskForm({ task, open });

  const updateOperation = useAsyncOperation({
    successMessage: "Task updated successfully",
    errorMessage: "Failed to update task",
    onSuccess: () => {
      onOpenChange(false);
      formData.resetForm();
    }
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !formData.title.trim() || isViewMode) {
      if (!isViewMode) {
        toast({
          title: "Validation Error",
          description: "Task title is required.",
          variant: "destructive",
        });
      }
      return;
    }

    await updateOperation.execute(() => 
      updateTask(task.id, formData.getFormData())
    );
  }, [task, formData, updateTask, updateOperation, toast, isViewMode]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      formData.resetForm();
    }
    onOpenChange(newOpen);
  }, [updateOperation.loading, formData, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'Task Details' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        
        {isViewMode ? (
          <EditTaskViewMode
            title={formData.title}
            description={formData.description}
            status={formData.status}
            priority={formData.priority}
            dueDate={formData.dueDate}
            onClose={() => handleOpenChange(false)}
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
              disabled={updateOperation.loading}
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
                  progress={formData.progress}
                  setProgress={formData.setProgress}
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
                />
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
                disabled={updateOperation.loading || !formData.title.trim()}
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
  );
});

EditTaskDialog.displayName = 'EditTaskDialog';
