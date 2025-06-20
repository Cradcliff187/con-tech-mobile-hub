
import { Task } from '@/types/database';
import { GanttEmptyState } from './GanttEmptyState';
import { VirtualGanttContainer } from './components/VirtualGanttContainer';
import { StandardGanttContainer } from './components/StandardGanttContainer';
import { useState, useEffect } from 'react';
import type { SimplifiedDragState } from './types/ganttTypes';

interface GanttChartContentProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId?: string;
  projectId?: string;
  // Simplified drag state props - only essential properties
  dragState?: SimplifiedDragState;
}

export const GanttChartContent = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  isDragging,
  timelineRef,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  projectId,
  dragState
}: GanttChartContentProps): JSX.Element => {
  const [useVirtualScroll, setUseVirtualScroll] = useState<boolean>(false);

  // Use virtual scrolling for large task lists (>50 tasks)
  useEffect(() => {
    setUseVirtualScroll(displayTasks.length > 50);
  }, [displayTasks.length]);

  // Handle empty state
  if (displayTasks.length === 0) {
    return <GanttEmptyState projectId={projectId || 'all'} />;
  }

  // Create complete drag state with defaults for compatibility
  const completeDragState = dragState ? {
    dropPreviewDate: dragState.dropPreviewDate,
    dragPosition: dragState.dragPosition,
    currentValidity: dragState.currentValidity,
    violationMessages: dragState.violationMessages,
    suggestedDropDate: dragState.suggestedDropDate,
    // Add compatibility properties with defaults
    validDropZones: [],
    showDropZones: false,
    affectedMarkerIds: []
  } : undefined;

  // Use virtual scrolling for performance with large task lists
  if (useVirtualScroll) {
    return (
      <VirtualGanttContainer
        displayTasks={displayTasks}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        selectedTaskId={selectedTaskId}
        onTaskSelect={onTaskSelect}
        viewMode={viewMode}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        draggedTaskId={draggedTaskId}
        projectId={projectId}
        isDragging={isDragging}
        dragState={completeDragState}
      />
    );
  }

  return (
    <StandardGanttContainer
      displayTasks={displayTasks}
      timelineStart={timelineStart}
      timelineEnd={timelineEnd}
      selectedTaskId={selectedTaskId}
      onTaskSelect={onTaskSelect}
      viewMode={viewMode}
      isDragging={isDragging}
      timelineRef={timelineRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggedTaskId={draggedTaskId}
      projectId={projectId}
      dragState={completeDragState}
    />
  );
};
