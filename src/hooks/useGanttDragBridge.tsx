
import { useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt';
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
}

export const useGanttDragBridge = ({
  timelineStart,
  timelineEnd,
  viewMode
}: UseGanttDragBridgeProps): GanttDragBridgeReturn => {
  const {
    state,
    startDrag,
    updateDragPreview,
    completeDrag,
    cancelDrag,
    setSaving
  } = useGanttContext();

  const { dragState, tasks, saving } = state;

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

  // Handle drop with date calculation and task update
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
    
    try {
      setSaving(true);
      
      // Calculate new end date maintaining duration
      const currentStart = task.start_date ? new Date(task.start_date) : new Date();
      const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      const updates: Partial<Task> = {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      };

      console.log('🎯 Completing drag with updates:', updates);
      
      // This will handle optimistic updates and database save
      await completeDrag(updates);
      
      // Show success feedback
      toast({
        title: "Task Updated",
        description: `"${task.title}" moved successfully`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Drop failed:', error);
      
      // Show error feedback
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update task position",
        variant: "destructive"
      });
      
      // Error is already handled in completeDrag, just ensure drag state is reset
      cancelDrag();
    } finally {
      setSaving(false);
    }
  }, [dragState, completeDrag, cancelDrag, setSaving]);

  // Handle drag end (cleanup)
  const handleDragEnd = useCallback(() => {
    console.log('🎯 Drag ended');
    
    // Only cancel if we're still dragging (drop might have already completed)
    if (dragState.isDragging) {
      cancelDrag();
    }
  }, [dragState.isDragging, cancelDrag]);

  return {
    // Drag state from context
    isDragging: dragState.isDragging,
    draggedTask: dragState.draggedTask,
    dropPreviewDate: dragState.dropPreviewDate,
    currentValidity: dragState.currentValidity,
    violationMessages: dragState.violationMessages,
    dragPosition: null, // Not implementing position tracking for simplicity
    isSaving: saving || false,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
