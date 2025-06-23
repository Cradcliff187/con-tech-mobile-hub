
import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useGanttCollapse } from '../hooks/useGanttCollapse';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttEmptyState } from '../GanttEmptyState';
import { StandardGanttContainer } from './StandardGanttContainer';
import { GanttEnhancedHeader } from './GanttEnhancedHeader';

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
    selectTask
  } = context;

  // Access state properties correctly
  const {
    loading,
    error,
    timelineStart,
    timelineEnd,
    selectedTaskId,
    viewMode,
    dragState
  } = state;

  console.log('🎯 GanttChartInner: Render with state:', {
    loading,
    error: error || 'No error',
    projectId,
    isCollapsed
  });

  // Get filtered tasks from context
  const displayTasks = getFilteredTasks();

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

  // Calculate timeline duration for header - use stable reference
  const totalDays = useMemo(() => {
    if (!timelineStart || !timelineEnd) return 0;
    return Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [timelineStart?.getTime(), timelineEnd?.getTime()]);

  // Calculate punch list tasks - use stable reference
  const punchListTasks = useMemo(() => {
    return displayTasks.filter(task => task.task_type === 'punch_list').length;
  }, [displayTasks.filter(t => t.task_type === 'punch_list').length]);

  // Calculate completed tasks - use stable reference
  const completedTasks = useMemo(() => {
    return displayTasks.filter(task => task.status === 'completed').length;
  }, [displayTasks.filter(t => t.status === 'completed').length]);

  return (
    <div className="w-full">
      <GanttEnhancedHeader 
        totalDays={totalDays}
        completedTasks={completedTasks}
        punchListTasks={punchListTasks}
        localUpdatesCount={0}
        onResetUpdates={() => {}}
        tasks={displayTasks}
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
