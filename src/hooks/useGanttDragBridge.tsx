
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
  suggestedDropDate: Date | null;
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
  
  // Get the real database update function
  const { updateTask: updateTaskInDB } = useTasks();

  // Get optimistic task - integrates with Gantt context
  const getOptimisticTask = useCallback((taskId: string): Task | null => {
    return getDisplayTask(taskId) || null;
  }, [getDisplayTask]);

  // Calculate suggested drop date when there are validation issues
  const getSuggestedDropDate = useCallback((
    originalDate: Date, 
    task: Task, 
    validity: 'valid' | 'warning' | 'invalid'
  ): Date | null => {
    if (validity === 'valid') return null;
    
    // For conflicts, suggest the next available slot
    // This is a simplified implementation - could be enhanced with more sophisticated logic
    const nextDay = new Date(originalDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return nextDay;
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    console.log('🎯 Starting drag for task:', task.id, task.title);
    
    // Set drag data
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Update context state
    startDrag(task);
  }, [startDrag]);

  // Handle drag over with position calculation and validation
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!dragState.isDragging || !dragState.draggedTask) return;

    // Calculate new date from drop position
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

    // Apply snapping
    const previewDate = getSnapDate(rawDate, viewMode);

    // Validate the drag
    const validation = validateTaskDrag(
      dragState.draggedTask,
      previewDate,
      timelineStart,
      timelineEnd,
      tasks
    );

    // Update drag preview in context
    updateDragPreview(previewDate, validation.validity, validation.messages);
  }, [dragState.isDragging, dragState.draggedTask, timelineStart, timelineEnd, viewMode, updateDragPreview, tasks]);

  // Handle drop with proper database update
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.dropPreviewDate) {
      console.warn('Invalid drop state');
      return;
    }

    // Only allow valid drops
    if (dragState.currentValidity === 'invalid') {
      console.warn('Drop prevented due to validation errors');
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
      console.log('🎯 Starting database update for task:', taskId);
      
      // Calculate new end date maintaining duration
      const currentStart = task.start_date ? new Date(task.start_date) : new Date();
      const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      const updates: Partial<Task> = {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      };

      console.log('🎯 Applying optimistic update:', updates);
      
      // Apply optimistic update first
      updateTaskOptimistic(taskId, updates);
      
      // Attempt database update using the real database function
      console.log('🎯 Saving to database via useTasks updateTask...');
      const result = await updateTaskInDB(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('✅ Database update successful');
      
      // Clear optimistic update on success (real data will come from subscription)
      clearOptimisticUpdate(taskId);
      
      // Reset drag state on success
      cancelDrag();
      
      // Show success feedback
      toast({
        title: "Task Updated",
        description: `"${task.title}" moved successfully`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Database update failed:', error);
      
      // Rollback optimistic update on failure
      clearOptimisticUpdate(taskId);
      
      // Reset drag state
      cancelDrag();
      
      // Show error feedback
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update task position",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [dragState, updateTaskOptimistic, updateTaskInDB, clearOptimisticUpdate, cancelDrag, setSaving]);

  // Handle drag end (cleanup)
  const handleDragEnd = useCallback(() => {
    console.log('🎯 Drag ended');
    
    // Only cancel if we're still dragging (drop might have already completed)
    if (dragState.isDragging) {
      cancelDrag();
    }
  }, [dragState.isDragging, cancelDrag]);

  // Calculate suggested drop date
  const suggestedDropDate = dragState.draggedTask && dragState.dropPreviewDate 
    ? getSuggestedDropDate(dragState.dropPreviewDate, dragState.draggedTask, dragState.currentValidity)
    : null;

  return {
    // Drag state from context
    isDragging: dragState.isDragging,
    draggedTask: dragState.draggedTask,
    dropPreviewDate: dragState.dropPreviewDate,
    currentValidity: dragState.currentValidity,
    violationMessages: dragState.violationMessages,
    suggestedDropDate,
    dragPosition: null, // Not implementing position tracking for simplicity
    isSaving: saving || false,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    
    // Utility methods
    getOptimisticTask,
  };
};
