
import { AlertTriangle } from 'lucide-react';
import { GanttLoadingState } from './GanttLoadingState';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GanttControls } from './gantt/GanttControls';
import { GanttStats } from './gantt/GanttStats';
import { GanttDropIndicator } from './gantt/GanttDropIndicator';
import { GanttLegend } from './gantt/GanttLegend';
import { GanttChartHeader } from './gantt/GanttChartHeader';
import { GanttChartContent } from './gantt/GanttChartContent';
import { GanttEmptyState } from './gantt/GanttEmptyState';
import { TimelineMiniMap } from './gantt/navigation/TimelineMiniMap';
import { useGanttChart } from './gantt/useGanttChart';
import { useState } from 'react';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart = ({ projectId }: GanttChartProps) => {
  const {
    projectTasks,
    displayTasks,
    loading,
    error,
    timelineStart,
    timelineEnd,
    timelineRef,
    timelineRect,
    totalDays,
    selectedTaskId,
    searchQuery,
    setSearchQuery,
    filters,
    viewMode,
    setViewMode,
    completedTasks,
    handleTaskSelect,
    handleFilterChange,
    dragAndDrop
  } = useGanttChart({ projectId });

  // Mini-map state for timeline navigation
  const [currentViewStart, setCurrentViewStart] = useState(timelineStart);
  const [currentViewEnd, setCurrentViewEnd] = useState(timelineEnd);
  const [showMiniMap, setShowMiniMap] = useState(false);

  // Handle loading state
  if (loading) {
    return <GanttLoadingState />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Error Loading Tasks</h3>
        <p className="text-slate-500">{error.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (projectTasks.length === 0) {
    return <GanttEmptyState projectId={projectId} />;
  }

  const punchListTasks = displayTasks.filter(t => t.task_type === 'punch_list').length;
  const localUpdatesCount = Object.keys(dragAndDrop.localTaskUpdates).length;
  const criticalTasks = displayTasks.filter(t => t.priority === 'critical').length;

  const handleMiniMapViewportChange = (start: Date, end: Date) => {
    setCurrentViewStart(start);
    setCurrentViewEnd(end);
    // Implement actual viewport scrolling here
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Enhanced Header with Construction Metrics */}
        <GanttChartHeader
          totalDays={totalDays}
          completedTasks={completedTasks}
          punchListTasks={punchListTasks}
          localUpdatesCount={localUpdatesCount}
          onResetUpdates={dragAndDrop.resetLocalUpdates}
        />

        {/* Construction-specific status indicators */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{criticalTasks} critical tasks</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Resource conflicts detected</span>
          </div>
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {showMiniMap ? 'Hide' : 'Show'} Timeline Overview
          </button>
        </div>

        {/* Interactive Controls */}
        <GanttControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Timeline Mini-map for navigation */}
        {showMiniMap && (
          <TimelineMiniMap
            tasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            currentViewStart={currentViewStart}
            currentViewEnd={currentViewEnd}
            onViewportChange={handleMiniMapViewportChange}
          />
        )}

        {/* Summary Statistics */}
        <GanttStats tasks={displayTasks} />

        {/* Enhanced Gantt Chart with Construction Features */}
        <GanttChartContent
          displayTasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          selectedTaskId={selectedTaskId}
          onTaskSelect={handleTaskSelect}
          viewMode={viewMode}
          isDragging={dragAndDrop.isDragging}
          timelineRef={timelineRef}
          onDragOver={dragAndDrop.handleDragOver}
          onDrop={dragAndDrop.handleDrop}
          onDragStart={dragAndDrop.handleDragStart}
          onDragEnd={dragAndDrop.handleDragEnd}
          draggedTaskId={dragAndDrop.draggedTask?.id}
          projectId={projectId}
        />

        <GanttLegend />

        {/* Drop Indicator */}
        <GanttDropIndicator
          isVisible={dragAndDrop.isDragging}
          position={dragAndDrop.dragPosition}
          previewDate={dragAndDrop.dropPreviewDate}
          timelineRect={timelineRect}
        />
      </div>
    </TooltipProvider>
  );
};
