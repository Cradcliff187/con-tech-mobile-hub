import React from 'react';
import { Task } from '@/types/database';
import { StandardGanttContainer } from './components/StandardGanttContainer';
import { VirtualGanttContainer } from './components/VirtualGanttContainer';
import { GanttOverlayManager } from './overlays/GanttOverlayManager';
import type { SimplifiedDragState } from './types/ganttTypes';

interface GanttChartContentProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging?: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  draggedTaskId?: string;
  projectId: string;
  dragState?: SimplifiedDragState;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const LARGE_TASK_THRESHOLD = 50; // Lowered threshold for better performance
const ENABLE_VIRTUAL_SCROLLING = true; // Enable virtual scrolling

export const GanttChartContent = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  isDragging = false,
  timelineRef,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  projectId,
  dragState,
  isCollapsed = false,
  onToggleCollapse
}: GanttChartContentProps) => {
  const shouldUseVirtualScrolling = ENABLE_VIRTUAL_SCROLLING && displayTasks.length > LARGE_TASK_THRESHOLD;

  console.log('🎯 GanttChartContent: Render decision:', {
    taskCount: displayTasks.length,
    threshold: LARGE_TASK_THRESHOLD,
    useVirtual: shouldUseVirtualScrolling,
    isDragging
  });

  return (
    <div 
      ref={timelineRef}
      className="relative"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {shouldUseVirtualScrolling ? (
        <VirtualGanttContainer
          displayTasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          selectedTaskId={selectedTaskId}
          onTaskSelect={onTaskSelect}
          viewMode={viewMode}
          isDragging={isDragging}
          draggedTaskId={draggedTaskId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          dragState={{
            dropPreviewDate: dragState?.dropPreviewDate || null,
            dragPosition: dragState?.dragPosition || null,
            currentValidity: dragState?.currentValidity || 'valid',
            validDropZones: [],
            showDropZones: false,
            violationMessages: dragState?.violationMessages || [],
            suggestedDropDate: dragState?.suggestedDropDate || null,
            affectedMarkerIds: []
          }}
        />
      ) : (
        <StandardGanttContainer
          displayTasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          selectedTaskId={selectedTaskId}
          onTaskSelect={onTaskSelect}
          viewMode={viewMode}
          isDragging={isDragging}
          draggedTaskId={draggedTaskId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          dropPreviewDate={dragState?.dropPreviewDate}
          currentValidity={dragState?.currentValidity || 'valid'}
          violationMessages={dragState?.violationMessages || []}
          dragPosition={dragState?.dragPosition}
        />
      )}

      {/* Overlay Manager for advanced features */}
      <GanttOverlayManager
        tasks={displayTasks}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        isDragging={isDragging}
        dropPreviewDate={dragState?.dropPreviewDate}
        dragPosition={dragState?.dragPosition}
        currentValidity={dragState?.currentValidity || 'valid'}
        violationMessages={dragState?.violationMessages || []}
        suggestedDropDate={dragState?.suggestedDropDate}
      />
    </div>
  );
};
