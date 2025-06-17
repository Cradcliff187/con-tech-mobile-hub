
import { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/database';
import { useDragAndDrop } from './useDragAndDrop';
import { getDaysBetween, getAssigneeName } from './ganttUtils';

interface UseGanttChartProps {
  projectId: string;
}

export const useGanttChart = ({ projectId }: UseGanttChartProps) => {
  const { tasks, loading, error } = useTasks();
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineRect, setTimelineRect] = useState<DOMRect | null>(null);
  
  // Interactive state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  }>({
    status: [],
    priority: [],
    category: [],
    phase: []
  });
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Drag and drop functionality
  const dragAndDrop = useDragAndDrop(timelineStart, timelineEnd, viewMode);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    if (filtered.length > 0) {
      setProjectTasks(filtered);

      // Calculate timeline bounds using actual task dates
      const tasksWithDates = filtered.filter(task => task.start_date || task.due_date);
      
      if (tasksWithDates.length > 0) {
        const allDates = tasksWithDates.flatMap(task => [
          task.start_date ? new Date(task.start_date) : null,
          task.due_date ? new Date(task.due_date) : null
        ].filter(Boolean) as Date[]);
        
        if (allDates.length > 0) {
          const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
          
          // Add padding based on view mode
          const padding = viewMode === 'days' ? 3 : viewMode === 'weeks' ? 7 : 30;
          minDate.setDate(minDate.getDate() - padding);
          maxDate.setDate(maxDate.getDate() + padding);
          
          setTimelineStart(minDate);
          setTimelineEnd(maxDate);
        }
      }
    } else {
      setProjectTasks([]);
    }
  }, [tasks, projectId, viewMode]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...projectTasks];
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        getAssigneeName(task).toLowerCase().includes(query) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }
    
    // Apply filters (AND logic)
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    
    if (filters.category.length > 0) {
      filtered = filtered.filter(task => 
        task.category && filters.category.some(cat => 
          task.category!.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }
    
    setFilteredTasks(filtered);
  }, [projectTasks, searchQuery, filters]);

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

  // Handle filter changes
  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const displayTasks = getDisplayTasks();
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;
  const totalDays = getDaysBetween(timelineStart, timelineEnd);

  return {
    // Data
    projectTasks,
    filteredTasks,
    displayTasks,
    loading,
    error,
    
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
