
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { VirtualScrollGantt } from '../navigation/VirtualScrollGantt';
import { GanttOverlayManager } from '../overlays/GanttOverlayManager';
import { useRef } from 'react';

interface VirtualGanttContainerProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId?: string;
  projectId?: string;
  isDragging: boolean;
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

export const VirtualGanttContainer = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  projectId,
  isDragging,
  dragState,
  isCollapsed = false
}: VirtualGanttContainerProps) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <GanttTimelineHeader
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          scrollRef={headerScrollRef}
        />
      </div>

      {/* Virtual Scrolled Gantt with master scroll container */}
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
          headerScrollRef={headerScrollRef}
          isCollapsed={isCollapsed}
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
};
