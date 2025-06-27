
import React from 'react';
import { Task } from '@/types/database';
import { GanttTimelineGrid } from '../GanttTimelineGrid';
import { SimpleTaskRow } from './SimpleTaskRow';

interface GanttTimelineAreaProps {
  displayTasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  collapsedTasks: Set<string>;
  onToggleCollapse: (taskId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const GanttTimelineArea = ({
  displayTasks,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  viewMode,
  timelineStart,
  timelineEnd,
  collapsedTasks,
  onToggleCollapse,
  scrollRef
}: GanttTimelineAreaProps) => {
  return (
    <div 
      ref={scrollRef}
      className="flex-1 relative overflow-auto"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin'
      }}
    >
      <GanttTimelineGrid
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
      />
      
      {/* Task bars overlay with header offset */}
      <div className="absolute inset-0 z-10" style={{ top: '32px' }}>
        {displayTasks.map((task, index) => (
          <div 
            key={task.id} 
            className="relative border-b border-slate-200 transition-all duration-200"
            style={{ height: collapsedTasks.has(task.id) ? '32px' : '64px' }}
          >
            <SimpleTaskRow
              task={task}
              selectedTaskId={selectedTaskId}
              onTaskSelect={onTaskSelect}
              onTaskUpdate={onTaskUpdate}
              viewMode={viewMode}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              isFirstRow={index === 0}
              timelineOnly={true}
              isCollapsed={collapsedTasks.has(task.id)}
              onToggleCollapse={onToggleCollapse}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
