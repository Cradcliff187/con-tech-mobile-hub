
import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useGanttCollapse } from '../hooks/useGanttCollapse';
import { useGanttDragBridge } from '@/hooks/useGanttDragBridge';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttEmptyState } from '../GanttEmptyState';
import { StandardGanttContainer } from './StandardGanttContainer';
import { GanttEnhancedHeader } from './GanttEnhancedHeader';
import { GanttControls } from '../GanttControls';

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
  
  const taskCounts = useMemo(() => {
    const total = displayTasks.length;
    const punchList = displayTasks.filter(task => task.task_type === 'punch_list').length;
    const completed = displayTasks.filter(task => task.status === 'completed').length;
    
    return { total, punchList, completed };
  }, [displayTasks]);

  const totalDays = useMemo(() => {
    if (!timelineStart || !timelineEnd) return 0;
    return Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [timelineStart?.getTime(), timelineEnd?.getTime()]);

  const safeFilters = useMemo(() => {
    return filters && typeof filters === 'object' && 'status' in filters 
      ? {
          status: filters.status || [],
          priority: filters.priority || [],
          category: filters.category || [],
          lifecycle_status: filters.lifecycle_status || []
        }
      : {
          status: [],
          priority: [],
          category: [],
          lifecycle_status: []
        };
  }, [filters]);

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

  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters({ [filterType]: values });
  };

  return (
    <div className="w-full space-y-6">
      <GanttEnhancedHeader 
        totalDays={totalDays}
        completedTasks={taskCounts.completed}
        punchListTasks={taskCounts.punchList}
        localUpdatesCount={0}
        onResetUpdates={() => {}}
        tasks={displayTasks}
      />

      <GanttControls
        searchQuery={searchQuery || ''}
        onSearchChange={setSearchQuery}
        filters={safeFilters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />
      
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
