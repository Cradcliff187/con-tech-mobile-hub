
import React from 'react';
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
}

export const GanttTaskList = ({
  displayTasks,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  viewMode,
  timelineStart,
  timelineEnd,
  collapsedTasks,
  onToggleCollapse
}: GanttTaskListProps) => {
  return (
    <div className="w-64 lg:w-72 flex-shrink-0 border-r border-slate-200 bg-white">
      <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3">
        <span className="text-sm font-medium text-slate-700">
          Tasks ({displayTasks.length})
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
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
