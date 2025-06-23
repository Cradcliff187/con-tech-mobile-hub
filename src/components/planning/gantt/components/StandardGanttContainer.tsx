
import React from 'react';
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTaskRow } from '../GanttTaskRow';
import { TaskListHeader } from './TaskListHeader';
import { DragPreviewIndicator } from './DragPreviewIndicator';
import { DragSnapGrid } from './DragSnapGrid';
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
  dropPreviewDate?: Date | null;
  currentValidity?: 'valid' | 'warning' | 'invalid';
  violationMessages?: string[];
  dragPosition?: { x: number; y: number } | null;
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
  onToggleCollapse,
  dropPreviewDate,
  currentValidity = 'valid',
  violationMessages = [],
  dragPosition
}: StandardGanttContainerProps) => {
  const { headerScrollRef, contentScrollRef } = useScrollSync();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Header with Timeline - Pass the shared scroll ref */}
      <div className="flex border-b border-slate-200">
        {/* Task List Header - Fixed/Frozen Column */}
        <div className="w-64 lg:w-72 border-r border-slate-200 flex-shrink-0 bg-white sticky left-0 z-10">
          {onToggleCollapse && (
            <TaskListHeader
              isCollapsed={isCollapsed}
              onToggleCollapse={onToggleCollapse}
              taskCount={displayTasks.length}
            />
          )}
        </div>

        {/* Timeline Header - Scrollable with shared scroll ref */}
        <div className="flex-1 overflow-hidden relative">
          <GanttTimelineHeader
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
            scrollRef={headerScrollRef}
          />
          
          {/* Snap grid overlay for timeline header */}
          <DragSnapGrid
            isVisible={isDragging}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Content with drag handlers */}
      <div 
        ref={contentScrollRef}
        className="max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Snap grid overlay for content area */}
        <DragSnapGrid
          isVisible={isDragging}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
        
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

      {/* Global drag preview indicator */}
      <DragPreviewIndicator
        isVisible={isDragging}
        position={dragPosition}
        previewDate={dropPreviewDate}
        validity={currentValidity}
        violationMessages={violationMessages}
      />
    </div>
  );
};
