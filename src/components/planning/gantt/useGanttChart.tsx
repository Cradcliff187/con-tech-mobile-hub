
import { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useGanttContext } from '@/contexts/gantt';
import { useTimelineCalculation } from './hooks/useTimelineCalculation';
import { useGanttDragBridge } from './hooks/useGanttDragBridge';
import type { 
  GanttChartHook, 
  FilterState, 
  FilterChangeHandler,
  ProjectData,
  DragAndDropState
} from './types/ganttTypes';
import type { Task } from '@/types/database';

interface UseGanttChartProps {
  projectId: string;
}

export const useGanttChart = ({ projectId }: UseGanttChartProps): GanttChartHook => {
  const { projects } = useProjects();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineRect, setTimelineRect] = useState<DOMRect | null>(null);
  
  // Get unified state from context
  const {
    state,
    getFilteredTasks,
    setSearchQuery,
    setFilters,
    setViewMode,
    selectTask
  } = useGanttContext();

  const {
    tasks: projectTasks,
    loading,
    error,
    selectedTaskId,
    searchQuery,
    filters,
    viewMode,
    timelineStart,
    timelineEnd,
    optimisticUpdates
  } = state;

  // Get selected project data with proper typing
  const selectedProject: ProjectData | null = projectId && projectId !== 'all' 
    ? projects.find(p => p.id === projectId) as ProjectData || null
    : null;

  // Get filtered tasks from context
  const filteredTasks: Task[] = getFilteredTasks();

  // Timeline calculation
  const { totalDays } = useTimelineCalculation({
    projectTasks: filteredTasks,
    viewMode,
    selectedProject
  });

  // Enhanced drag and drop with context integration
  const dragBridge = useGanttDragBridge({
    timelineStart,
    timelineEnd,
    viewMode
  });

  // Properly typed drag and drop interface
  const dragAndDrop: DragAndDropState = {
    isDragging: dragBridge.isDragging,
    draggedTask: dragBridge.draggedTask,
    dropPreviewDate: dragBridge.dropPreviewDate,
    currentValidity: dragBridge.currentValidity,
    violationMessages: dragBridge.violationMessages,
    suggestedDropDate: dragBridge.suggestedDropDate,
    dragPosition: dragBridge.dragPosition,
    localTaskUpdates: {},
    
    // Handlers
    handleDragStart: dragBridge.handleDragStart,
    handleDragEnd: dragBridge.handleDragEnd,
    handleDragOver: dragBridge.handleDragOver,
    handleDrop: dragBridge.handleDrop,
    
    // Utility methods
    getUpdatedTask: (task: Task): Task => {
      return dragBridge.getOptimisticTask(task.id) || task;
    },
    
    resetLocalUpdates: (): void => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset local updates (handled by context)');
      }
    }
  };

  // Update timeline rect on resize or when timeline changes
  useEffect(() => {
    const updateTimelineRect = (): void => {
      if (timelineRef.current) {
        setTimelineRect(timelineRef.current.getBoundingClientRect());
        if (process.env.NODE_ENV === 'development') {
          timelineRef.current.setAttribute('data-timeline-container', 'true');
        }
      }
    };

    updateTimelineRect();
    window.addEventListener('resize', updateTimelineRect);
    return () => window.removeEventListener('resize', updateTimelineRect);
  }, [timelineStart, timelineEnd, filteredTasks]);

  // Get updated tasks with optimistic changes
  const getDisplayTasks = (): Task[] => {
    return filteredTasks.map(task => dragAndDrop.getUpdatedTask(task));
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string): void => {
    selectTask(selectedTaskId === taskId ? null : taskId);
  };

  // Handle filter changes with proper typing
  const handleFilterChange: FilterChangeHandler = (filterType: string, values: string[]): void => {
    setFilters({ [filterType]: values } as Partial<FilterState>);
  };

  const displayTasks = getDisplayTasks();
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;

  // Calculate optimistic updates count
  const optimisticUpdatesCount = optimisticUpdates ? optimisticUpdates.size : 0;

  return {
    // Data
    projectTasks,
    filteredTasks,
    displayTasks,
    loading,
    error,
    selectedProject,
    
    // Timeline
    timelineStart,
    timelineEnd,
    timelineRef,
    timelineRect,
    totalDays,
    
    // UI State
    selectedTaskId,
    searchQuery,
    setSearchQuery,
    filters,
    viewMode,
    setViewMode,
    
    // Stats
    completedTasks,
    
    // Handlers
    handleTaskSelect,
    handleFilterChange,
    
    // Drag and Drop
    dragAndDrop,
    optimisticUpdatesCount,
    isDragging: dragAndDrop.isDragging
  };
};
