
import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { useTaskProcessing } from '../hooks/useTaskProcessing';
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
  const context = useGanttContext();
  const { isCollapsed, toggleCollapse } = useGanttCollapse();

  // Early return if context is not available
  if (!context) {
    console.error('❌ GanttChartInner: Context not available');
    return <GanttErrorState error="Gantt context not initialized" />;
  }

  const {
    state,
    getFilteredTasks,
    selectTask
  } = context;

  // Access state properties correctly
  const {
    tasks,
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
    error: typeof error === 'string' ? error : error?.message || 'Unknown error',
    tasksCount: tasks?.length || 0,
    projectId,
    isCollapsed
  });

  const { processedTasks, processingStats } = useTaskProcessing({ projectId });

  // Loading state
  if (loading) {
    console.log('⏳ GanttChartInner: Showing loading state');
    return <GanttLoadingState />;
  }

  // Error state - handle both string and Error object types
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error occurred';
    console.error('❌ GanttChartInner: Showing error state:', errorMessage);
    return <GanttErrorState error={errorMessage} />;
  }

  // Get filtered tasks from context
  const displayTasks = getFilteredTasks();

  // Empty state
  if (!displayTasks || displayTasks.length === 0) {
    console.log('📭 GanttChartInner: Showing empty state');
    return <GanttEmptyState projectId={projectId} />;
  }

  console.log('✅ GanttChartInner: Rendering Gantt chart with', displayTasks.length, 'tasks, collapsed:', isCollapsed);

  const handleTaskSelect = (taskId: string) => {
    selectTask(selectedTaskId === taskId ? null : taskId);
  };

  // Calculate timeline duration for header
  const totalDays = useMemo(() => {
    if (!timelineStart || !timelineEnd) return 0;
    return Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [timelineStart, timelineEnd]);

  // Calculate punch list tasks
  const punchListTasks = useMemo(() => {
    return displayTasks.filter(task => task.task_type === 'punch_list').length;
  }, [displayTasks]);

  return (
    <div className="w-full">
      <GanttEnhancedHeader 
        totalDays={totalDays}
        completedTasks={processingStats.completedTasks}
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
