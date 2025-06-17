
import { useState, useCallback } from 'react';
import { Task } from '@/types/database';
import { getDateFromPosition, getTaskDuration, createDragPreview } from './ganttUtils';

interface DragAndDropState {
  draggedTask: Task | null;
  dragPosition: { x: number; y: number } | null;
  dropPreviewDate: Date | null;
  isDragging: boolean;
  localTaskUpdates: Record<string, Partial<Task>>;
}

export const useDragAndDrop = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
) => {
  const [state, setState] = useState<DragAndDropState>({
    draggedTask: null,
    dragPosition: null,
    dropPreviewDate: null,
    isDragging: false,
    localTaskUpdates: {}
  });

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setState(prev => ({ ...prev, draggedTask: task, isDragging: true }));
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag preview
    const dragImage = createDragPreview(task);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag preview after a short delay
    setTimeout(() => {
      if (dragImage.parentNode) {
        dragImage.parentNode.removeChild(dragImage);
      }
    }, 100);
  }, []);

  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      draggedTask: null,
      isDragging: false,
      dropPreviewDate: null,
      dragPosition: null
    }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!state.draggedTask) return;
    
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
    
    setState(prev => ({
      ...prev,
      dropPreviewDate: previewDate,
      dragPosition: { x: e.clientX, y: e.clientY }
    }));
  }, [state.draggedTask, timelineStart, timelineEnd, viewMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!state.draggedTask) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    const newStartDate = getDateFromPosition(
      relativeX,
      timelineWidth,
      timelineStart,
      timelineEnd,
      viewMode
    );
    
    updateTaskDates(state.draggedTask.id, newStartDate);
    
    setState(prev => ({
      ...prev,
      draggedTask: null,
      isDragging: false,
      dropPreviewDate: null,
      dragPosition: null
    }));
  }, [state.draggedTask, timelineStart, timelineEnd, viewMode]);

  const updateTaskDates = useCallback((taskId: string, newStartDate: Date) => {
    const task = state.draggedTask;
    if (!task) return;
    
    const duration = getTaskDuration(task);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + duration);
    
    setState(prev => ({
      ...prev,
      localTaskUpdates: {
        ...prev.localTaskUpdates,
        [taskId]: {
          start_date: newStartDate.toISOString(),
          due_date: newEndDate.toISOString()
        }
      }
    }));
  }, [state.draggedTask]);

  const resetLocalUpdates = useCallback(() => {
    setState(prev => ({ ...prev, localTaskUpdates: {} }));
  }, []);

  const getUpdatedTask = useCallback((task: Task): Task => {
    const updates = state.localTaskUpdates[task.id];
    return updates ? { ...task, ...updates } : task;
  }, [state.localTaskUpdates]);

  return {
    ...state,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateTaskDates,
    resetLocalUpdates,
    getUpdatedTask
  };
};
