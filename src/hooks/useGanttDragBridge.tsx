
import { useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { Task } from '@/types/database';
import { getDateFromPosition } from '@/components/planning/gantt/utils/dragUtils';
import { validateTaskDrag, getSnapDate } from '@/components/planning/gantt/utils/dragValidation';

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
    cancelDrag
  } = useGanttContext();

  const { dragState, tasks } = state;

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

    // Store drag position for visual feedback
    const dragPosition = { x: e.clientX, y: e.clientY };

    // Update drag preview in context
    updateDragPreview(previewDate, validation.validity, validation.messages);
    
    // Store position (we'll need to enhance context to handle this)
    console.log('🎯 Drag position:', dragPosition, 'Preview date:', previewDate, 'Validity:', validation.validity);
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
      cancelDrag();
      return;
    }

    const task = dragState.draggedTask;
    const newStartDate = dragState.dropPreviewDate;
    
    try {
      // Calculate new end date maintaining duration
      const currentStart = task.start_date ? new Date(task.start_date) : new Date();
      const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
      const duration = Math.max(1, Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)));
      
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + duration);

      const updates: Partial<Task> = {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      };

      console.log('🎯 Completing drag with updates:', updates);
      
      // This will handle optimistic updates and database save
      await completeDrag(updates);
      
    } catch (error) {
      console.error('❌ Drop failed:', error);
      // Error is already handled in completeDrag, just ensure drag state is reset
      cancelDrag();
    }
  }, [dragState, completeDrag, cancelDrag]);

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
    dragPosition: null, // We'll need to enhance context to store this
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
