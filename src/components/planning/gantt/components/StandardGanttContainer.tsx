
import React, { useRef } from 'react';
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTaskRow } from '../GanttTaskRow';
import { TaskListHeader } from './TaskListHeader';
import { useScrollSync } from '../hooks/useScrollSync';

interface StandardGanttContainerProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging?: boolean;
  draggedTaskId?: string;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StandardGanttContainer = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  isDragging = false,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  isCollapsed = false,
  onToggleCollapse
}: StandardGanttContainerProps) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Use the scroll sync hook without arguments - it likely uses refs internally
  useScrollSync();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Timeline */}
      <div className="flex border-b border-slate-200">
        {/* Task List Header */}
        <div className="w-80 lg:w-96 border-r border-slate-200 flex-shrink-0">
          {onToggleCollapse && (
            <TaskListHeader
              isCollapsed={isCollapsed}
              onToggleCollapse={onToggleCollapse}
              taskCount={displayTasks.length}
            />
          )}
        </div>

        {/* Timeline Header */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={headerScrollRef}
            className="overflow-x-auto scrollbar-none"
          >
            <GanttTimelineHeader
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentScrollRef}
        className="max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
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
      </div>
    </div>
  );
};
