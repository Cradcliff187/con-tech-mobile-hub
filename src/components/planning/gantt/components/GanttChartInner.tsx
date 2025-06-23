
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttControls } from '../GanttControls';
import { GanttStats } from '../GanttStats';
import { GanttDropIndicator } from '../GanttDropIndicator';
import { GanttLegend } from '../GanttLegend';
import { GanttChartContent } from '../GanttChartContent';
import { GanttEmptyState } from '../GanttEmptyState';
import { TimelineMiniMap } from '../navigation/TimelineMiniMap';
import { GanttEnhancedHeader } from './GanttEnhancedHeader';
import { GanttStatusIndicators } from './GanttStatusIndicators';
import { GanttErrorState } from './GanttErrorState';
import { GanttProjectOverview } from '../GanttProjectOverview';
import { useGanttChart } from '../useGanttChart';
import { useGanttState } from '../hooks/useGanttState';
import { useGanttCollapse } from '../hooks/useGanttCollapse';
import { useProjects } from '@/hooks/useProjects';
import { GanttNavigationHandlers } from './GanttNavigationHandlers';
import type { SimplifiedDragState } from '../types/ganttTypes';

interface GanttChartInnerProps {
  projectId: string;
}

export const GanttChartInner = ({ projectId }: GanttChartInnerProps): JSX.Element => {
  const { projects } = useProjects();
  
  // Add collapse functionality
  const { isCollapsed, toggleCollapse } = useGanttCollapse();
  
  // Add debugging log
  console.log('📊 GanttChart: isCollapsed=', isCollapsed, 'toggleCollapse=', !!toggleCollapse);
  
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
    dragAndDrop,
    optimisticUpdatesCount,
    isDragging
  } = useGanttChart({ projectId });

  const {
    currentViewStart,
    currentViewEnd,
    showMiniMap,
    setShowMiniMap,
    timelineReady,
    handleMiniMapViewportChange
  } = useGanttState({ timelineStart, timelineEnd });

  // Get selected project with proper error handling
  const selectedProject = React.useMemo(() => {
    if (!projectId || projectId === 'all' || !projects.length) {
      return null;
    }
    return projects.find(p => p.id === projectId) || null;
  }, [projectId, projects]);

  // Handle loading state
  if (loading) {
    return <GanttLoadingState />;
  }

  // Handle error state
  if (error) {
    return <GanttErrorState error={error} />;
  }

  // Handle empty state
  if (projectTasks.length === 0) {
    return <GanttEmptyState projectId={projectId} />;
  }

  // Don't render timeline-dependent components until timeline is ready
  if (!timelineReady) {
    return <GanttLoadingState />;
  }

  const punchListTasks = displayTasks.filter(t => t.task_type === 'punch_list').length;
  const localUpdatesCount = Object.keys(dragAndDrop.localTaskUpdates).length;
  const criticalTasks = displayTasks.filter(t => t.priority === 'critical').length;

  // Simplified drag state - only essential properties
  const dragState: SimplifiedDragState = {
    dropPreviewDate: dragAndDrop.dropPreviewDate,
    dragPosition: dragAndDrop.dragPosition,
    currentValidity: dragAndDrop.currentValidity,
    violationMessages: dragAndDrop.violationMessages,
    suggestedDropDate: dragAndDrop.suggestedDropDate || dragAndDrop.dropPreviewDate
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Enhanced Header with Construction Metrics */}
        <GanttEnhancedHeader
          totalDays={totalDays}
          completedTasks={completedTasks}
          punchListTasks={punchListTasks}
          localUpdatesCount={localUpdatesCount}
          onResetUpdates={dragAndDrop.resetLocalUpdates}
          tasks={displayTasks}
        />

        {/* Construction-specific status indicators */}
        <GanttStatusIndicators
          criticalTasks={criticalTasks}
          isDragging={dragAndDrop.isDragging}
          currentValidity={dragAndDrop.currentValidity}
          showMiniMap={showMiniMap}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        />

        {/* Interactive Controls with Collapse Toggle */}
        <GanttControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
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

        {/* Summary Statistics with Timeline Navigation */}
        <GanttStats 
          tasks={displayTasks} 
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          onNavigateToDate={(date: Date) => 
            GanttNavigationHandlers.handleNavigateToDate(date, timelineRef, timelineStart, timelineEnd)
          }
        />

        {/* Project Overview Timeline */}
        <GanttProjectOverview
          project={selectedProject}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          currentViewStart={currentViewStart}
          currentViewEnd={currentViewEnd}
          completedTasks={completedTasks}
          totalTasks={displayTasks.length}
          onNavigateToDate={(date: Date) => 
            GanttNavigationHandlers.handleNavigateToDate(date, timelineRef, timelineStart, timelineEnd)
          }
          viewMode={viewMode}
        />

        {/* Enhanced Gantt Chart with Construction Features and Drag Integration */}
        <div className="relative">
          <GanttChartContent
            displayTasks={displayTasks}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            viewMode={viewMode}
            isDragging={isDragging}
            timelineRef={timelineRef}
            onDragOver={dragAndDrop.handleDragOver}
            onDrop={dragAndDrop.handleDrop}
            onDragStart={dragAndDrop.handleDragStart}
            onDragEnd={dragAndDrop.handleDragEnd}
            draggedTaskId={dragAndDrop.draggedTask?.id}
            projectId={projectId}
            dragState={dragState}
            isCollapsed={isCollapsed}
          />
        </div>

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
