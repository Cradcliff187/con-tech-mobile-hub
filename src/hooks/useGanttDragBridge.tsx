
import { useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { Task } from '@/types/database';
import { getDateFromPosition } from '@/components/planning/gantt/utils/dragUtils';

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

  const { dragState } = state;

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
    
    const previewDate = getDateFromPosition(
      relativeX,
      timelineWidth,
      timelineStart,
      timelineEnd,
      viewMode
    );

    // Simple validation (can be enhanced later)
    const isValid = previewDate >= timelineStart && previewDate <= timelineEnd;
    const validity: 'valid' | 'warning' | 'invalid' = isValid ? 'valid' : 'invalid';
    const messages = isValid ? [] : ['Date is outside timeline range'];

    // Update drag preview in context
    updateDragPreview(previewDate, validity, messages);
  }, [dragState.isDragging, dragState.draggedTask, timelineStart, timelineEnd, viewMode, updateDragPreview]);

  // Handle drop with date calculation and task update
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.dropPreviewDate) {
      console.warn('Invalid drop state');
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
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
