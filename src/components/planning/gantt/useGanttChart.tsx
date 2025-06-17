import { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useDragAndDrop } from './useDragAndDrop';
import { useTimelineCalculation } from './hooks/useTimelineCalculation';
import { useGanttFilters } from './hooks/useGanttFilters';
import { useTaskProcessing } from './hooks/useTaskProcessing';

interface UseGanttChartProps {
  projectId: string;
}

export const useGanttChart = ({ projectId }: UseGanttChartProps) => {
  const { projects } = useProjects();
  const { updateTask, refetch: refetchTasks } = useTasks();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineRect, setTimelineRect] = useState<DOMRect | null>(null);
  
  // Interactive state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');

  // Get selected project data
  const selectedProject = projectId && projectId !== 'all' 
    ? projects.find(p => p.id === projectId) 
    : null;

  // Task processing
  const { projectTasks, loading, error, completedTasks } = useTaskProcessing({ projectId });

  // Timeline calculation
  const { timelineStart, timelineEnd, totalDays } = useTimelineCalculation({
    projectTasks,
    viewMode,
    selectedProject
  });

  // Filtering
  const { 
    searchQuery, 
    setSearchQuery, 
    filters, 
    filteredTasks, 
    handleFilterChange 
  } = useGanttFilters({ projectTasks });

  // Drag and drop functionality with database persistence and refetch
  const dragAndDrop = useDragAndDrop({
    timelineStart,
    timelineEnd,
    viewMode,
    allTasks: projectTasks,
    updateTask,
    refetchTasks
  });

  // Update timeline rect on resize or when timeline changes
  useEffect(() => {
    const updateTimelineRect = () => {
      if (timelineRef.current) {
        setTimelineRect(timelineRef.current.getBoundingClientRect());
      }
    };

    updateTimelineRect();
    window.addEventListener('resize', updateTimelineRect);
    return () => window.removeEventListener('resize', updateTimelineRect);
  }, [timelineStart, timelineEnd, filteredTasks]);

  // Get updated tasks with local changes
  const getDisplayTasks = () => {
    return filteredTasks.map(task => dragAndDrop.getUpdatedTask(task));
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  const displayTasks = getDisplayTasks();

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
    dragAndDrop
  };
};
