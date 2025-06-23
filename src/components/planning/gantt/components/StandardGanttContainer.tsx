
import React from 'react';
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
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
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
  onDragOver,
  onDrop,
  isCollapsed = false,
  onToggleCollapse
}: StandardGanttContainerProps) => {
  // Use the scroll sync hook and get the refs it returns
  const { headerScrollRef, contentScrollRef } = useScrollSync();

  console.log('🎯 StandardGanttContainer: Drag handlers available:', {
    onDragStart: !!onDragStart,
    onDragEnd: !!onDragEnd,
    onDragOver: !!onDragOver,
    onDrop: !!onDrop,
    isDragging,
    draggedTaskId
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Timeline */}
      <div className="flex border-b border-slate-200">
        {/* Task List Header - Fixed/Frozen Column - Reduced Width */}
        <div className="w-64 lg:w-72 border-r border-slate-200 flex-shrink-0 bg-white sticky left-0 z-10">
          {onToggleCollapse && (
            <TaskListHeader
              isCollapsed={isCollapsed}
              onToggleCollapse={onToggleCollapse}
              taskCount={displayTasks.length}
            />
          )}
        </div>

        {/* Timeline Header - Scrollable */}
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

      {/* Content - Add drag event handlers to the container */}
      <div 
        ref={contentScrollRef}
        className="max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
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
      </div>
    </div>
  );
};
