
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTaskRow } from '../GanttTaskRow';
import { GanttProgressIndicator } from '../GanttProgressIndicator';
import { GanttOverlayManager } from '../overlays/GanttOverlayManager';
import { useScrollSync } from '../hooks/useScrollSync';

interface StandardGanttContainerProps {
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
  isCollapsed?: boolean;
}

export const StandardGanttContainer = ({
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
  dragState,
  isCollapsed = false
}: StandardGanttContainerProps) => {
  const { headerScrollRef, contentScrollRef } = useScrollSync();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Timeline Header */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        scrollRef={headerScrollRef}
      />

      {/* Master Scroll Container - Single scrollbar for entire chart */}
      <div 
        ref={contentScrollRef}
        className="overflow-x-auto scrollbar-none md:scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 touch-pan-x"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}
      >
        {/* Gantt Chart Body */}
        <div 
          ref={timelineRef}
          className="min-w-max relative"
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
              isCollapsed={isCollapsed}
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
    </div>
  );
};
