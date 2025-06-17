
import { Task } from '@/types/database';
import { GanttTimelineHeader } from './GanttTimelineHeader';
import { GanttTaskCard } from './GanttTaskCard';
import { GanttTimelineBar } from './GanttTimelineBar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { VirtualScrollGantt } from './navigation/VirtualScrollGantt';
import { GanttMilestoneMarkers } from './markers/GanttMilestoneMarkers';
import { WeatherDelayMarkers } from './markers/WeatherDelayMarkers';
import { CriticalPathHighlight } from './markers/CriticalPathHighlight';
import { ResourceConflictIndicators } from './markers/ResourceConflictIndicators';
import { useRef, useEffect, useState } from 'react';

interface GanttChartContentProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId?: string;
  projectId?: string;
}

export const GanttChartContent = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  isDragging,
  timelineRef,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  projectId
}: GanttChartContentProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Use virtual scrolling for large task lists (>50 tasks)
  useEffect(() => {
    setUseVirtualScroll(displayTasks.length > 50);
  }, [displayTasks.length]);

  // Sync horizontal scroll between header and content
  const handleScrollSync = (headerScrollRef: React.RefObject<HTMLDivElement>) => {
    if (!headerScrollRef.current || !scrollContainerRef.current) return;

    const headerScroll = headerScrollRef.current;
    const contentScroll = scrollContainerRef.current;

    const handleHeaderScroll = () => {
      contentScroll.scrollLeft = headerScroll.scrollLeft;
    };

    const handleContentScroll = () => {
      headerScroll.scrollLeft = contentScroll.scrollLeft;
    };

    headerScroll.addEventListener('scroll', handleHeaderScroll);
    contentScroll.addEventListener('scroll', handleContentScroll);

    return () => {
      headerScroll.removeEventListener('scroll', handleHeaderScroll);
      contentScroll.removeEventListener('scroll', handleContentScroll);
    };
  };

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

  // Use virtual scrolling for performance with large task lists
  if (useVirtualScroll) {
    return (
      <div className="space-y-4">
        {/* Timeline Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <GanttTimelineHeader
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        </div>

        {/* Virtual Scrolled Gantt */}
        <div className="relative">
          <VirtualScrollGantt
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            viewMode={viewMode}
            containerHeight={600}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggedTaskId={draggedTaskId}
          />

          {/* Overlay markers for virtual scroll */}
          {projectId && (
            <GanttMilestoneMarkers
              projectId={projectId}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          )}
          <WeatherDelayMarkers
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
          <CriticalPathHighlight
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
          <ResourceConflictIndicators
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Timeline Header with Navigation */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        onScrollUpdate={handleScrollSync}
      />

      {/* Gantt Chart Body */}
      <div 
        ref={timelineRef}
        className="relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {displayTasks.map((task, index) => (
          <div key={task.id} className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
            {/* Task Card */}
            <div className="w-80 lg:w-96 border-r border-slate-200">
              <GanttTaskCard
                task={task}
                isSelected={selectedTaskId === task.id}
                onSelect={onTaskSelect}
                viewMode={viewMode}
              />
            </div>

            {/* Timeline Area */}
            <div className="flex-1 relative">
              <div 
                ref={index === 0 ? scrollContainerRef : undefined}
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
              >
                <div className="min-w-max relative">
                  <GanttTimelineBar
                    task={task}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onTaskSelect}
                    viewMode={viewMode}
                    isDragging={draggedTaskId === task.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Construction Project Progress Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (displayTasks.filter(t => t.status === 'completed').length / displayTasks.length) * 100)}%` 
            }}
          />
        </div>

        {/* Construction-specific overlay markers */}
        {projectId && (
          <GanttMilestoneMarkers
            projectId={projectId}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
        )}
        
        <WeatherDelayMarkers
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
        
        <CriticalPathHighlight
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
        
        <ResourceConflictIndicators
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
        />
      </div>
    </div>
  );
};
