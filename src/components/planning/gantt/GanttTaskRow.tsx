
import React from 'react';
import { Task } from '@/types/database';
import { SimpleTaskCard } from './components/SimpleTaskCard';
import { GanttTimelineBar } from './GanttTimelineBar';
import { GanttCollapsedTaskCard } from './GanttCollapsedTaskCard';

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
  isCollapsed?: boolean;
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
  isCollapsed = false
}: GanttTaskRowProps) => {
  const isSelected = selectedTaskId === task.id;

  return (
    <div className={`flex border-b border-slate-200 hover:bg-slate-50 transition-colors ${isFirstRow ? 'border-t' : ''}`}>
      {/* Task List Column - Fixed/Frozen */}
      <div className="w-64 lg:w-72 border-r border-slate-200 flex-shrink-0 bg-white sticky left-0 z-10">
        {isCollapsed ? (
          <GanttCollapsedTaskCard 
            task={task} 
            isSelected={isSelected}
            onSelect={onTaskSelect}
          />
        ) : (
          <SimpleTaskCard
            task={task}
            isSelected={isSelected}
            onClick={() => onTaskSelect(task.id)}
          />
        )}
      </div>

      {/* Timeline Column - Scrollable */}
      <div className="flex-1 relative">
        <GanttTimelineBar
          task={task}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          isSelected={isSelected}
          onSelect={onTaskSelect}
          viewMode={viewMode}
          isDragging={isDragging}
          draggedTaskId={draggedTaskId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      </div>
    </div>
  );
};
