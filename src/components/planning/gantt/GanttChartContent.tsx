
import { Task } from '@/types/database';
import { GanttEmptyState } from './GanttEmptyState';
import { VirtualGanttContainer } from './components/VirtualGanttContainer';
import { StandardGanttContainer } from './components/StandardGanttContainer';
import { useState, useEffect } from 'react';

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
  // Simplified drag state props
  dragState?: {
    dropPreviewDate: Date | null;
    dragPosition: { x: number; y: number } | null;
    currentValidity: 'valid' | 'warning' | 'invalid';
    violationMessages: string[];
    suggestedDropDate: Date | null;
  };
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
}: GanttChartContentProps) => {
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Use virtual scrolling for large task lists (>50 tasks)
  useEffect(() => {
    setUseVirtualScroll(displayTasks.length > 50);
  }, [displayTasks.length]);

  // Handle empty state - use GanttEmptyState directly
  if (displayTasks.length === 0) {
    return <GanttEmptyState projectId={projectId || 'all'} />;
  }

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
        dragState={dragState}
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
      dragState={dragState}
    />
  );
};
