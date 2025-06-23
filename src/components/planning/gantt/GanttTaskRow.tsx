
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
  isFirstRow = false
}: GanttTaskRowProps) => {
  return (
    <div className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
      {/* Task Card */}
      <div className="w-80 lg:w-96 border-r border-slate-200 flex-shrink-0">
        <GanttTaskCard
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={onTaskSelect}
          viewMode={viewMode}
        />
      </div>

      {/* Timeline Area - No individual scrolling */}
      <div className="flex-1 relative" style={{ minHeight: '60px' }}>
        {/* Timeline Grid Background - Only render for first row to avoid duplication */}
        {isFirstRow && (
          <GanttTimelineGrid
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        )}

        {/* Timeline content - let parent handle scrolling */}
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
  );
};
