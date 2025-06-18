
import { GanttLoadingState } from './GanttLoadingState';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GanttControls } from './gantt/GanttControls';
import { GanttStats } from './gantt/GanttStats';
import { GanttDropIndicator } from './gantt/GanttDropIndicator';
import { GanttLegend } from './gantt/GanttLegend';
import { GanttChartContent } from './gantt/GanttChartContent';
import { GanttEmptyState } from './gantt/GanttEmptyState';
import { TimelineMiniMap } from './gantt/navigation/TimelineMiniMap';
import { useGanttChart } from './gantt/useGanttChart';
import { GanttEnhancedHeader } from './gantt/components/GanttEnhancedHeader';
import { GanttStatusIndicators } from './gantt/components/GanttStatusIndicators';
import { GanttErrorState } from './gantt/components/GanttErrorState';
import { useGanttState } from './gantt/hooks/useGanttState';
import { GanttProjectOverview } from './gantt/GanttProjectOverview';
import { useProjects } from '@/hooks/useProjects';
import { GanttProvider } from '@/contexts/gantt';

interface GanttChartProps {
  projectId: string;
}

const GanttChartContent = ({ projectId }: GanttChartProps) => {
  const { projects } = useProjects();
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

  const {
    currentViewStart,
    currentViewEnd,
    showMiniMap,
    setShowMiniMap,
    timelineReady,
    handleMiniMapViewportChange
  } = useGanttState({ timelineStart, timelineEnd });

  // Get selected project
  const selectedProject = projectId && projectId !== 'all' 
    ? projects.find(p => p.id === projectId) 
    : null;

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

  // Enhanced drag state for overlay integration
  const enhancedDragState = {
    dropPreviewDate: dragAndDrop.dropPreviewDate,
    dragPosition: dragAndDrop.dragPosition,
    currentValidity: dragAndDrop.currentValidity,
    validDropZones: dragAndDrop.validDropZones,
    showDropZones: dragAndDrop.showDropZones,
    violationMessages: dragAndDrop.violationMessages,
    suggestedDropDate: dragAndDrop.suggestedDropDate,
    affectedMarkerIds: dragAndDrop.affectedMarkerIds
  };

  // Navigation handler for project overview
  const handleNavigateToDate = (date: Date) => {
    // Use existing timeline navigation functionality
    if (timelineRef.current) {
      const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysFromStart = Math.ceil((date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      
      const container = timelineRef.current;
      const scrollableWidth = container.scrollWidth - container.clientWidth;
      const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
      
      // Center the target date in the viewport
      const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
      
      container.scrollTo({
        left: centeredPosition,
        behavior: 'smooth'
      });
    }
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
        />

        {/* Construction-specific status indicators */}
        <GanttStatusIndicators
          criticalTasks={criticalTasks}
          isDragging={dragAndDrop.isDragging}
          currentValidity={dragAndDrop.currentValidity}
          showMiniMap={showMiniMap}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        />

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

        {/* Project Overview Timeline */}
        <GanttProjectOverview
          project={selectedProject}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          currentViewStart={currentViewStart}
          currentViewEnd={currentViewEnd}
          completedTasks={completedTasks}
          totalTasks={displayTasks.length}
          onNavigateToDate={handleNavigateToDate}
          viewMode={viewMode}
        />

        {/* Enhanced Gantt Chart with Construction Features and Drag Integration */}
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
          dragState={enhancedDragState}
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

export const GanttChart = ({ projectId }: GanttChartProps) => {
  return (
    <GanttProvider projectId={projectId}>
      <GanttChartContent projectId={projectId} />
    </GanttProvider>
  );
};
