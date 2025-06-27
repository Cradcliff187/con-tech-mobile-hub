
import React from 'react';
import { Task } from '@/types/database';

interface GanttStatusBarProps {
  displayTasks: Task[];
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  historyLength: number;
  collapsedTasks: Set<string>;
  isSystemBusy: boolean;
}

export const GanttStatusBar = ({
  displayTasks,
  viewMode,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  historyLength,
  collapsedTasks,
  isSystemBusy
}: GanttStatusBarProps) => {
  return (
    <div className="h-6 bg-slate-50 border-t border-slate-200 flex items-center px-3 text-xs text-slate-600 flex-shrink-0">
      <span>
        {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''} • 
        {viewMode} view • 
        {timelineStart.toLocaleDateString()} - {timelineEnd.toLocaleDateString()}
      </span>
      {selectedTaskId && (
        <span className="ml-4 text-blue-600">
          Task selected: {displayTasks.find(t => t.id === selectedTaskId)?.title}
        </span>
      )}
      {historyLength > 0 && (
        <span className="ml-4 text-slate-500">
          {historyLength} action{historyLength !== 1 ? 's' : ''} in history
        </span>
      )}
      {collapsedTasks.size > 0 && (
        <span className="ml-4 text-slate-500">
          {collapsedTasks.size} task{collapsedTasks.size !== 1 ? 's' : ''} collapsed
        </span>
      )}
      {isSystemBusy && (
        <span className="ml-4 text-orange-600">
          Saving changes...
        </span>
      )}
    </div>
  );
};
