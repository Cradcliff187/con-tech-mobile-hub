
import { useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useEnhancedDragDrop } from '@/hooks/useEnhancedDragDrop';
import { Task } from '@/types/database';

interface UseGanttDragBridgeProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const useGanttDragBridge = ({
  timelineStart,
  timelineEnd,
  viewMode
}: UseGanttDragBridgeProps) => {
  const {
    state,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    startDrag,
    updateDragPreview,
    completeDrag,
    cancelDrag
  } = useGanttContext();

  const { dragState, tasks } = state;

  // Enhanced drag drop integration
  const enhancedDragDrop = useEnhancedDragDrop({
    tasks,
    timelineStart,
    timelineEnd,
    viewMode,
    updateTask: async (id: string, updates: Partial<Task>) => {
      try {
        await completeDrag(updates);
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error: error instanceof Error ? error.message : 'Update failed' };
      }
    }
  });

  // Bridge drag handlers to context
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    startDrag(task);
    enhancedDragDrop.handleDragStart(e, task);
  }, [startDrag, enhancedDragDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    enhancedDragDrop.handleDragOver(e);
    
    if (enhancedDragDrop.dragPreview.previewDate) {
      updateDragPreview(
        enhancedDragDrop.dragPreview.previewDate,
        enhancedDragDrop.dragPreview.validity,
        enhancedDragDrop.dragPreview.violationMessages
      );
    }
  }, [enhancedDragDrop, updateDragPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    enhancedDragDrop.handleDrop(e);
  }, [enhancedDragDrop]);

  const handleDragEnd = useCallback(() => {
    enhancedDragDrop.handleDragEnd();
    if (dragState.isDragging) {
      cancelDrag();
    }
  }, [enhancedDragDrop, dragState.isDragging, cancelDrag]);

  return {
    // Drag state from context
    isDragging: dragState.isDragging,
    draggedTask: dragState.draggedTask,
    dropPreviewDate: dragState.dropPreviewDate,
    currentValidity: dragState.currentValidity,
    violationMessages: dragState.violationMessages,
    
    // Enhanced features from useEnhancedDragDrop
    dragPosition: enhancedDragDrop.dragPreview.position,
    isSaving: enhancedDragDrop.isSaving,
    hasActiveOperations: enhancedDragDrop.hasActiveOperations,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    
    // Task utilities
    getOptimisticTask: enhancedDragDrop.getOptimisticTask,
    optimisticTasks: enhancedDragDrop.optimisticTasks
  };
};
