
import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useGanttCollapse } from '../hooks/useGanttCollapse';
import { useGanttDragBridge } from '@/hooks/useGanttDragBridge';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttEmptyState } from '../GanttEmptyState';
import { StandardGanttContainer } from './StandardGanttContainer';

interface GanttChartInnerProps {
  projectId: string;
}

export const GanttChartInner = ({ projectId }: GanttChartInnerProps) => {
  const context = useGanttContext();
  const { isCollapsed, toggleCollapse } = useGanttCollapse();

  const {
    state,
    getFilteredTasks,
    selectTask,
    setSearchQuery,
    setFilters,
    setViewMode
  } = context;

  const {
    loading,
    error,
    timelineStart,
    timelineEnd,
    selectedTaskId,
    viewMode,
    searchQuery,
    filters
  } = state;

  const dragBridge = useGanttDragBridge({
    timelineStart,
    timelineEnd,
    viewMode
  });

  const displayTasks = useMemo(() => {
    return getFilteredTasks();
  }, [getFilteredTasks]);

  if (loading) {
    return <GanttLoadingState />;
  }

  if (error) {
    return <GanttErrorState error={error} />;
  }

  if (!displayTasks || displayTasks.length === 0) {
    return <GanttEmptyState projectId={projectId} />;
  }

  const handleTaskSelect = (taskId: string) => {
    selectTask(selectedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="w-full space-y-6">
      <StandardGanttContainer
        displayTasks={displayTasks}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        selectedTaskId={selectedTaskId}
        onTaskSelect={handleTaskSelect}
        viewMode={viewMode}
        isDragging={dragBridge.isDragging}
        draggedTaskId={dragBridge.draggedTask?.id || null}
        onDragStart={dragBridge.handleDragStart}
        onDragEnd={dragBridge.handleDragEnd}
        onDragOver={dragBridge.handleDragOver}
        onDrop={dragBridge.handleDrop}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        dropPreviewDate={dragBridge.dropPreviewDate}
        currentValidity={dragBridge.currentValidity}
        violationMessages={dragBridge.violationMessages}
        dragPosition={dragBridge.dragPosition}
      />
    </div>
  );
};
