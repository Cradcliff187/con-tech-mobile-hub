
import React, { memo } from 'react';
import { Task } from '@/types/database';
import { SimpleTaskRow } from './SimpleTaskRow';

interface GanttTaskListProps {
  displayTasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  collapsedTasks: Set<string>;
  onToggleCollapse: (taskId: string) => void;
  width: number;
}

const GanttTaskListComponent = ({
  displayTasks,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  viewMode,
  timelineStart,
  timelineEnd,
  collapsedTasks,
  onToggleCollapse,
  width
}: GanttTaskListProps) => {
  return (
    <div 
      className="flex-shrink-0 border-r border-slate-200 bg-white"
      style={{ width: `${width}px` }}
    >
      <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3">
        <span className="text-sm font-medium text-slate-700">
          Tasks ({displayTasks.length})
        </span>
      </div>
      
      <div className="overflow-y-auto overflow-x-hidden flex-1">
        {displayTasks.map((task, index) => (
          <div key={task.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
            <SimpleTaskRow
              task={task}
              selectedTaskId={selectedTaskId}
              onTaskSelect={onTaskSelect}
              onTaskUpdate={onTaskUpdate}
              viewMode={viewMode}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              isFirstRow={index === 0}
              timelineOnly={false}
              isCollapsed={collapsedTasks.has(task.id)}
              onToggleCollapse={onToggleCollapse}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoized component for performance
export const GanttTaskList = memo(GanttTaskListComponent, (prevProps, nextProps) => {
  return (
    prevProps.displayTasks.length === nextProps.displayTasks.length &&
    prevProps.selectedTaskId === nextProps.selectedTaskId &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.timelineStart.getTime() === nextProps.timelineStart.getTime() &&
    prevProps.timelineEnd.getTime() === nextProps.timelineEnd.getTime() &&
    prevProps.collapsedTasks.size === nextProps.collapsedTasks.size &&
    prevProps.width === nextProps.width
  );
});
