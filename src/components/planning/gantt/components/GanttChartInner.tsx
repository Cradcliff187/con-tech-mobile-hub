
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
    error: error?.message,
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

  // Error state
  if (error) {
    console.error('❌ GanttChartInner: Showing error state:', error);
    return <GanttErrorState error={error} />;
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

  return (
    <div className="w-full">
      <GanttEnhancedHeader 
        taskCount={displayTasks.length}
        processingStats={processingStats}
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
