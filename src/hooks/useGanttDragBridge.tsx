
import { useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/database';
import { getDateFromPosition } from '@/components/planning/gantt/utils/dragUtils';
import { validateTaskDrag, getSnapDate } from '@/components/planning/gantt/utils/dragValidation';
import { toast } from '@/hooks/use-toast';

interface UseGanttDragBridgeProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

interface GanttDragBridgeReturn {
  isDragging: boolean;
  draggedTask: Task | null;
  dropPreviewDate: Date | null;
  currentValidity: 'valid' | 'warning' | 'invalid';
  violationMessages: string[];
  dragPosition: { x: number; y: number } | null;
  isSaving: boolean;
  handleDragStart: (e: React.DragEvent, task: Task) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  getOptimisticTask: (taskId: string) => Task | null;
}

export const useGanttDragBridge = ({
  timelineStart,
  timelineEnd,
  viewMode
}: UseGanttDragBridgeProps): GanttDragBridgeReturn => {
  const {
    state,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    startDrag,
    updateDragPreview,
    cancelDrag,
    setSaving,
    getDisplayTask
  } = useGanttContext();

  const { dragState, tasks, saving } = state;
  const { updateTask: updateTaskInDB } = useTasks();

  const getOptimisticTask = useCallback((taskId: string): Task | null => {
    return getDisplayTask(taskId) || null;
  }, [getDisplayTask]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    startDrag(task);
  }, [startDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!dragState.isDragging || !dragState.draggedTask) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    const rawDate = getDateFromPosition(
      relativeX,
      timelineWidth,
      timelineStart,
      timelineEnd,
      viewMode
    );

    const previewDate = getSnapDate(rawDate, viewMode);

    const validation = validateTaskDrag(
      dragState.draggedTask,
      previewDate,
      timelineStart,
      timelineEnd,
      tasks
    );

    updateDragPreview(previewDate, validation.validity, validation.messages);
  }, [dragState.isDragging, dragState.draggedTask, timelineStart, timelineEnd, viewMode, updateDragPreview, tasks]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.dropPreviewDate) {
      return;
    }

    if (dragState.currentValidity === 'invalid') {
      toast({
        title: "Drop Failed",
        description: dragState.violationMessages[0] || "Invalid drop position",
        variant: "destructive"
      });
      cancelDrag();
      return;
    }

    const task = dragState.draggedTask;
    const newStartDate = dragState.dropPreviewDate;
    const taskId = task.id;
    
    try {
      setSaving(true);
      
      const currentStart = task.start_date ? new Date(task.start_date) : new Date();
      const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      const updates: Partial<Task> = {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      };

      updateTaskOptimistic(taskId, updates);
      
      const result = await updateTaskInDB(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      clearOptimisticUpdate(taskId);
      cancelDrag();
      
      toast({
        title: "Task Updated",
        description: `"${task.title}" moved successfully`,
        variant: "default"
      });
      
    } catch (error) {
      clearOptimisticUpdate(taskId);
      cancelDrag();
      
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update task position",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [dragState, updateTaskOptimistic, updateTaskInDB, clearOptimisticUpdate, cancelDrag, setSaving]);

  const handleDragEnd = useCallback(() => {
    if (dragState.isDragging) {
      cancelDrag();
    }
  }, [dragState.isDragging, cancelDrag]);

  return {
    isDragging: dragState.isDragging,
    draggedTask: dragState.draggedTask,
    dropPreviewDate: dragState.dropPreviewDate,
    currentValidity: dragState.currentValidity,
    violationMessages: dragState.violationMessages,
    dragPosition: null,
    isSaving: saving || false,
    
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    
    getOptimisticTask,
  };
};
