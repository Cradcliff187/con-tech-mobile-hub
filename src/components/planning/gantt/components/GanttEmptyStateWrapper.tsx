
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface GanttEmptyStateWrapperProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttEmptyStateWrapper = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  viewMode
}: GanttEmptyStateWrapperProps) => {
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
  return null;
};
