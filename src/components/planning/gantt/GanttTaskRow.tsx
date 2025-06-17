
import { Task } from '@/types/database';
import { GanttTaskCard } from './GanttTaskCard';
import { GanttTimelineBar } from './GanttTimelineBar';
import { GanttTimelineGrid } from './GanttTimelineGrid';

interface GanttTaskRowProps {
  task: Task;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  isDragging?: boolean;
  draggedTaskId?: string;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  isFirstRow?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const GanttTaskRow = ({
  task,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  timelineStart,
  timelineEnd,
  isDragging = false,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  isFirstRow = false,
  scrollContainerRef
}: GanttTaskRowProps) => {
  return (
    <div className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
      {/* Task Card */}
      <div className="w-80 lg:w-96 border-r border-slate-200">
        <GanttTaskCard
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={onTaskSelect}
          viewMode={viewMode}
        />
      </div>

      {/* Timeline Area */}
      <div className="flex-1 relative">
        {/* Timeline Grid Background - Only render for first row to avoid duplication */}
        {isFirstRow && (
          <GanttTimelineGrid
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        )}

        <div 
          ref={isFirstRow ? scrollContainerRef : undefined}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 relative z-10"
        >
          <div className="min-w-max relative">
            <GanttTimelineBar
              task={task}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              isSelected={selectedTaskId === task.id}
              onSelect={onTaskSelect}
              viewMode={viewMode}
              isDragging={draggedTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
