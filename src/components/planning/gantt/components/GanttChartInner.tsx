
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
    tasks,
    loading,
    error,
    timelineStart,
    timelineEnd,
    displayTasks,
    selectedTaskId,
    setSelectedTaskId,
    viewMode,
    isDragging,
    draggedTaskId,
    handleDragStart,
    handleDragEnd,
    onTaskUpdate
  } = context;

  console.log('🎯 GanttChartInner: Render with state:', {
    loading,
    error: error?.message,
    tasksCount: tasks?.length || 0,
    displayTasksCount: displayTasks?.length || 0,
    projectId,
    isCollapsed
  });

  const { processedTasks, processingStats } = useTaskProcessing(displayTasks || []);

  // Loading state
  if (loading) {
    console.log('⏳ GanttChartInner: Showing loading state');
    return <GanttLoadingState />;
  }

  // Error state
  if (error) {
    console.error('❌ GanttChartInner: Showing error state:', error);
    return <GanttErrorState error={error.message} />;
  }

  // Empty state
  if (!processedTasks || processedTasks.length === 0) {
    console.log('📭 GanttChartInner: Showing empty state');
    return <GanttEmptyState projectId={projectId} />;
  }

  console.log('✅ GanttChartInner: Rendering Gantt chart with', processedTasks.length, 'tasks, collapsed:', isCollapsed);

  return (
    <div className="w-full">
      <GanttEnhancedHeader 
        projectId={projectId}
        taskCount={processedTasks.length}
        processingStats={processingStats}
      />
      
      <StandardGanttContainer
        displayTasks={processedTasks}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        selectedTaskId={selectedTaskId}
        onTaskSelect={setSelectedTaskId}
        viewMode={viewMode}
        isDragging={isDragging}
        draggedTaskId={draggedTaskId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
    </div>
  );
};
