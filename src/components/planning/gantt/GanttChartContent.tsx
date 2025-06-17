
import { Task } from '@/types/database';
import { GanttTimelineHeader } from './GanttTimelineHeader';
import { GanttTaskRow } from './GanttTaskRow';
import { GanttProgressIndicator } from './GanttProgressIndicator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { VirtualScrollGantt } from './navigation/VirtualScrollGantt';
import { GanttOverlayManager } from './overlays/GanttOverlayManager';
import { useRef, useEffect, useState } from 'react';

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
  // Enhanced drag state props for overlay integration
  dragState?: {
    dropPreviewDate: Date | null;
    dragPosition: { x: number; y: number } | null;
    currentValidity: 'valid' | 'warning' | 'invalid';
    validDropZones: Array<{ start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }>;
    showDropZones: boolean;
    violationMessages: string[];
    suggestedDropDate: Date | null;
    affectedMarkerIds: string[];
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Use virtual scrolling for large task lists (>50 tasks)
  useEffect(() => {
    setUseVirtualScroll(displayTasks.length > 50);
  }, [displayTasks.length]);

  // Sync horizontal scroll between header and content
  const handleScrollSync = (headerScrollRef: React.RefObject<HTMLDivElement>) => {
    if (!headerScrollRef.current || !scrollContainerRef.current) return;

    const headerScroll = headerScrollRef.current;
    const contentScroll = scrollContainerRef.current;

    const handleHeaderScroll = () => {
      contentScroll.scrollLeft = headerScroll.scrollLeft;
    };

    const handleContentScroll = () => {
      headerScroll.scrollLeft = contentScroll.scrollLeft;
    };

    headerScroll.addEventListener('scroll', handleHeaderScroll);
    contentScroll.addEventListener('scroll', handleContentScroll);

    return () => {
      headerScroll.removeEventListener('scroll', handleHeaderScroll);
      contentScroll.removeEventListener('scroll', handleContentScroll);
    };
  };

  if (displayTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <GanttTimelineHeader
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
        <div className="p-8 text-center">
          <LoadingSpinner size="sm" text="Loading tasks..." />
        </div>
      </div>
    );
  }

  // Use virtual scrolling for performance with large task lists
  if (useVirtualScroll) {
    return (
      <div className="space-y-4">
        {/* Timeline Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <GanttTimelineHeader
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        </div>

        {/* Virtual Scrolled Gantt */}
        <div className="relative">
          <VirtualScrollGantt
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            viewMode={viewMode}
            containerHeight={600}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggedTaskId={draggedTaskId}
          />

          {/* Enhanced Overlay Manager for virtual scroll with drag integration */}
          <GanttOverlayManager
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
            projectId={projectId}
            className="pointer-events-none"
            isDragging={isDragging}
            draggedTaskId={draggedTaskId}
            affectedMarkerIds={dragState?.affectedMarkerIds || []}
            dropPreviewDate={dragState?.dropPreviewDate}
            dragPosition={dragState?.dragPosition}
            currentValidity={dragState?.currentValidity || 'valid'}
            validDropZones={dragState?.validDropZones || []}
            showDropZones={dragState?.showDropZones || false}
            violationMessages={dragState?.violationMessages || []}
            suggestedDropDate={dragState?.suggestedDropDate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Timeline Header with Navigation */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        onScrollUpdate={handleScrollSync}
      />

      {/* Gantt Chart Body */}
      <div 
        ref={timelineRef}
        className="relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {displayTasks.map((task, index) => (
          <GanttTaskRow
            key={task.id}
            task={task}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            viewMode={viewMode}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            isDragging={isDragging}
            draggedTaskId={draggedTaskId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isFirstRow={index === 0}
            scrollContainerRef={scrollContainerRef}
          />
        ))}

        {/* Construction Project Progress Indicator */}
        <GanttProgressIndicator tasks={displayTasks} />

        {/* Enhanced Overlay Manager with full drag integration */}
        <GanttOverlayManager
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          projectId={projectId}
          isDragging={isDragging}
          draggedTaskId={draggedTaskId}
          affectedMarkerIds={dragState?.affectedMarkerIds || []}
          dropPreviewDate={dragState?.dropPreviewDate}
          dragPosition={dragState?.dragPosition}
          currentValidity={dragState?.currentValidity || 'valid'}
          validDropZones={dragState?.validDropZones || []}
          showDropZones={dragState?.showDropZones || false}
          violationMessages={dragState?.violationMessages || []}
          suggestedDropDate={dragState?.suggestedDropDate}
        />
      </div>
    </div>
  );
};
