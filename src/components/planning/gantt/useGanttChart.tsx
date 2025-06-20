
import { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useGanttContext } from '@/contexts/gantt';
import { useTimelineCalculation } from './hooks/useTimelineCalculation';
import { useGanttDragBridge } from './hooks/useGanttDragBridge';
import { useDebugMode } from './hooks/useDebugMode';

interface UseGanttChartProps {
  projectId: string;
}

export const useGanttChart = ({ projectId }: UseGanttChartProps) => {
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

  // Debug mode functionality - proper ES6 import
  const {
    isDebugMode,
    debugPreferences,
    toggleDebugMode,
    updateDebugPreference,
    isDevelopment
  } = useDebugMode();

  // Get selected project data
  const selectedProject = projectId && projectId !== 'all' 
    ? projects.find(p => p.id === projectId) 
    : null;

  // Get filtered tasks from context
  const filteredTasks = getFilteredTasks();

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

  // Fixed drag and drop interface - include all required properties
  const dragAndDrop = {
    isDragging: dragBridge.isDragging,
    draggedTask: dragBridge.draggedTask,
    dropPreviewDate: dragBridge.dropPreviewDate,
    currentValidity: dragBridge.currentValidity,
    violationMessages: dragBridge.violationMessages,
    suggestedDropDate: dragBridge.suggestedDropDate, // Now properly included
    
    // Position and visual state
    dragPosition: dragBridge.dragPosition,
    
    // Local updates tracking (handled by context now)
    localTaskUpdates: {},
    
    // Handlers
    handleDragStart: dragBridge.handleDragStart,
    handleDragEnd: dragBridge.handleDragEnd,
    handleDragOver: dragBridge.handleDragOver,
    handleDrop: dragBridge.handleDrop,
    
    // Utility methods
    getUpdatedTask: (task: any) => {
      return dragBridge.getOptimisticTask(task.id) || task;
    },
    
    resetLocalUpdates: () => {
      // Context manages optimistic updates, no local reset needed
      console.log('Reset local updates (handled by context)');
    }
  };

  // Update timeline rect on resize or when timeline changes
  useEffect(() => {
    const updateTimelineRect = () => {
      if (timelineRef.current) {
        setTimelineRect(timelineRef.current.getBoundingClientRect());
        // Add data attribute for debug overlay (only in development)
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
  const getDisplayTasks = () => {
    return filteredTasks.map(task => dragAndDrop.getUpdatedTask(task));
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    selectTask(selectedTaskId === taskId ? null : taskId);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters({ [filterType]: values });
  };

  const displayTasks = getDisplayTasks();
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;

  // Calculate optimistic updates count for debug overlay
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

    // Debug Mode - only exposed in development
    isDebugMode: process.env.NODE_ENV === 'development' ? isDebugMode : false,
    debugPreferences: process.env.NODE_ENV === 'development' ? debugPreferences : {},
    toggleDebugMode: process.env.NODE_ENV === 'development' ? toggleDebugMode : () => {},
    updateDebugPreference: process.env.NODE_ENV === 'development' ? updateDebugPreference : () => {},
    isDevelopment: process.env.NODE_ENV === 'development' ? isDevelopment : false,
    optimisticUpdatesCount: process.env.NODE_ENV === 'development' ? optimisticUpdatesCount : 0,
    isDragging: dragAndDrop.isDragging
  };
};
