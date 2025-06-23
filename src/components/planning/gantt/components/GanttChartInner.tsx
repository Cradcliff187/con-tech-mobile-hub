
import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useGanttCollapse } from '../hooks/useGanttCollapse';
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
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const context = useGanttContext();
  const { isCollapsed, toggleCollapse } = useGanttCollapse();

  // Access context properties
  const {
    state,
    getFilteredTasks,
    selectTask,
    setSearchQuery,
    setFilters,
    setViewMode
  } = context;

  // Access state properties correctly
  const {
    loading,
    error,
    timelineStart,
    timelineEnd,
    selectedTaskId,
    viewMode,
    dragState,
    searchQuery,
    filters
  } = state;

  console.log('🎯 GanttChartInner: Render with state:', {
    loading,
    error: error || 'No error',
    projectId,
    isCollapsed
  });

  // Get filtered tasks from context - memoize to create stable reference
  const displayTasks = useMemo(() => {
    return getFilteredTasks();
  }, [getFilteredTasks]);
  
  // Create stable task signature for dependencies
  const taskSignature = useMemo(() => {
    const taskIds = displayTasks.map(t => t.id).sort().join('|');
    const taskTypes = displayTasks.map(t => t.task_type || 'none').sort().join('|');
    const taskStatuses = displayTasks.map(t => t.status).sort().join('|');
    return `${displayTasks.length}-${taskIds}-${taskTypes}-${taskStatuses}`;
  }, [displayTasks.length, displayTasks]);

  // Create stable references for counts using primitive dependencies
  const taskCounts = useMemo(() => {
    const total = displayTasks.length;
    const punchList = displayTasks.filter(task => task.task_type === 'punch_list').length;
    const completed = displayTasks.filter(task => task.status === 'completed').length;
    
    console.log('📊 Calculating task counts:', { total, punchList, completed });
    
    return { total, punchList, completed };
  }, [taskSignature]);

  // Calculate timeline duration for header - use stable reference - MOVED UP BEFORE EARLY RETURNS
  const totalDays = useMemo(() => {
    if (!timelineStart || !timelineEnd) return 0;
    return Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [timelineStart?.getTime(), timelineEnd?.getTime()]);

  // Ensure filters has proper FilterState structure
  const safeFilters = useMemo(() => {
    return filters && typeof filters === 'object' && 'status' in filters 
      ? filters 
      : {
          status: [],
          priority: [],
          category: [],
          lifecycle_status: []
        };
  }, [filters]);

  // Loading state
  if (loading) {
    console.log('⏳ GanttChartInner: Showing loading state');
    return <GanttLoadingState />;
  }

  // Error state - error is a string | null
  if (error) {
    console.error('❌ GanttChartInner: Showing error state:', error);
    return <GanttErrorState error={error} />;
  }

  // Empty state
  if (!displayTasks || displayTasks.length === 0) {
    console.log('📭 GanttChartInner: Showing empty state');
    return <GanttEmptyState projectId={projectId} />;
  }

  console.log('✅ GanttChartInner: Rendering Gantt chart with', displayTasks.length, 'tasks, collapsed:', isCollapsed);

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
        isDragging={dragState.isDragging}
        draggedTaskId={dragState.draggedTask?.id || null}
        onDragStart={() => {}} // These will be handled by drag bridge
        onDragEnd={() => {}}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
    </div>
  );
};
