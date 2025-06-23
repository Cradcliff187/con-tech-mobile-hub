
import React from 'react';
import { Task } from '@/types/database';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTaskRow } from '../GanttTaskRow';
import { TaskListHeader } from './TaskListHeader';
import { DragPreviewIndicator } from './DragPreviewIndicator';
import { DragSnapGrid } from './DragSnapGrid';
import { DependencyArrows } from './DependencyArrows';
import { MilestoneMarkers } from './MilestoneMarkers';
import { ResourceVisualization } from './ResourceVisualization';
import { EnhancedTaskOperations } from './EnhancedTaskOperations';
import { useScrollSync } from '../hooks/useScrollSync';
import { useGanttContext } from '@/contexts/gantt';

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
  
  // Get enhanced context data
  const {
    state: { dependencies, selectedTasks, multiSelectMode },
    createDependency,
    deleteDependency,
    setSelectedTasks,
    setMultiSelectMode
  } = useGanttContext();

  // Mock data for demonstration - in real implementation, these would come from context/props
  const mockMilestones = [
    {
      id: '1',
      name: 'Foundation Complete',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'upcoming' as const,
      linkedTaskIds: displayTasks.slice(0, 2).map(t => t.id),
      critical: false
    },
    {
      id: '2',
      name: 'Framing Complete',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'current' as const,
      linkedTaskIds: displayTasks.slice(2, 4).map(t => t.id),
      critical: true
    }
  ];

  const mockResourceAllocations = displayTasks.slice(0, 3).map(task => ({
    id: `res-${task.id}`,
    taskId: task.id,
    resourceType: 'personnel' as const,
    resourceName: 'Construction Crew',
    allocation: Math.floor(Math.random() * 100) + 50,
    isOverAllocated: Math.random() > 0.7,
    color: '#3b82f6'
  }));

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // TODO: Implement via context
    console.log('Update task:', taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    // TODO: Implement via context
    console.log('Delete task:', taskId);
  };

  const handleTaskDuplicate = (taskId: string) => {
    // TODO: Implement via context
    console.log('Duplicate task:', taskId);
  };

  const handleBulkUpdate = (taskIds: string[], updates: Partial<Task>) => {
    // TODO: Implement via context
    console.log('Bulk update:', taskIds, updates);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Enhanced Task Operations Panel */}
      {selectedTasks.length > 0 && (
        <div className="border-b border-slate-200 p-4">
          <EnhancedTaskOperations
            selectedTasks={selectedTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskDuplicate={handleTaskDuplicate}
            onBulkUpdate={handleBulkUpdate}
            onCreateDependency={createDependency}
            isMultiSelectMode={multiSelectMode}
            onToggleMultiSelect={() => setMultiSelectMode(!multiSelectMode)}
          />
        </div>
      )}

      {/* Header with Timeline */}
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

      {/* Content with drag handlers and enhanced features */}
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
        
        {/* Task rows */}
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

        {/* Dependency arrows overlay */}
        <DependencyArrows
          dependencies={dependencies}
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          onDependencyDelete={deleteDependency}
        />

        {/* Milestone markers overlay */}
        <MilestoneMarkers
          milestones={mockMilestones}
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />

        {/* Resource visualization overlay */}
        <ResourceVisualization
          tasks={displayTasks}
          resourceAllocations={mockResourceAllocations}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          showConflicts={true}
        />
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
