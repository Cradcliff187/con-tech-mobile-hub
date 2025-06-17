import { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Task } from '@/types/database';
import { useDragAndDrop } from './useDragAndDrop';
import { getDaysBetween, getAssigneeName, getProjectTimelineBounds, calculateTaskDatesFromEstimate } from './ganttUtils';

interface UseGanttChartProps {
  projectId: string;
}

// Construction phase duration estimates (in days)
const CONSTRUCTION_PHASE_DURATIONS = {
  'foundation': 21,
  'framing': 30,
  'electrical': 14,
  'plumbing': 14,
  'hvac': 21,
  'finish': 28,
  'paint': 7,
  'default': 14
};

const getTaskDurationEstimate = (task: Task): number => {
  // First try to use estimated_hours converted to days
  if (task.estimated_hours && task.estimated_hours > 0) {
    return Math.ceil(task.estimated_hours / 8); // 8-hour workday
  }
  
  // Fallback to category-based estimates
  const category = task.category?.toLowerCase() || '';
  
  for (const [phase, duration] of Object.entries(CONSTRUCTION_PHASE_DURATIONS)) {
    if (category.includes(phase)) {
      return duration;
    }
  }
  
  return CONSTRUCTION_PHASE_DURATIONS.default;
};

const calculateTimelineRange = (
  tasks: Task[], 
  viewMode: 'days' | 'weeks' | 'months',
  selectedProject: any = null
) => {
  // **PHASE 1: PRIMARY - Use project start/end dates**
  if (selectedProject?.start_date && selectedProject?.end_date) {
    const projectStart = new Date(selectedProject.start_date);
    const projectEnd = new Date(selectedProject.end_date);
    
    // Check if any tasks extend beyond project boundaries
    let earliestTaskDate = projectStart;
    let latestTaskDate = projectEnd;
    
    tasks.forEach(task => {
      const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      
      if (calculatedStartDate < earliestTaskDate) {
        earliestTaskDate = calculatedStartDate;
      }
      if (calculatedEndDate > latestTaskDate) {
        latestTaskDate = calculatedEndDate;
      }
    });
    
    // Use the broader range (project dates or extended task dates)
    const timelineStart = earliestTaskDate < projectStart ? earliestTaskDate : projectStart;
    const timelineEnd = latestTaskDate > projectEnd ? latestTaskDate : projectEnd;
    
    // Add buffer based on view mode (1-2 weeks)
    const bufferDays = viewMode === 'days' ? 7 : viewMode === 'weeks' ? 14 : 21;
    
    const start = new Date(timelineStart);
    start.setDate(start.getDate() - bufferDays);
    
    const end = new Date(timelineEnd);
    end.setDate(end.getDate() + bufferDays);
    
    return { start, end };
  }
  
  // **FALLBACK: Use task-based calculation if project dates missing**
  if (tasks.length === 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const end = new Date(now);
    end.setDate(end.getDate() + 90); // 3 months default for construction
    return { start, end };
  }

  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Process all tasks to find actual date ranges with enhanced calculation
  tasks.forEach(task => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    
    if (!minDate || calculatedStartDate < minDate) minDate = calculatedStartDate;
    if (!maxDate || calculatedEndDate > maxDate) maxDate = calculatedEndDate;
  });

  if (!minDate || !maxDate) {
    const now = new Date();
    minDate = new Date(now);
    minDate.setDate(minDate.getDate() - 30);
    maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 90);
  }

  // Calculate project duration for intelligent padding
  const projectDurationDays = getDaysBetween(minDate, maxDate);
  
  // Add padding based on project duration and view mode
  let paddingDays: number;
  
  if (viewMode === 'days') {
    paddingDays = Math.max(7, Math.min(21, projectDurationDays * 0.1)); // 10% padding, 1-3 weeks
  } else if (viewMode === 'weeks') {
    paddingDays = Math.max(14, Math.min(42, projectDurationDays * 0.15)); // 15% padding, 2-6 weeks
  } else { // months
    paddingDays = Math.max(30, Math.min(90, projectDurationDays * 0.2)); // 20% padding, 1-3 months
  }

  const start = new Date(minDate);
  start.setDate(start.getDate() - paddingDays);
  
  const end = new Date(maxDate);
  end.setDate(end.getDate() + paddingDays);

  // Ensure minimum timeline span for construction projects
  const totalDays = getDaysBetween(start, end);
  const minimumDays = viewMode === 'days' ? 60 : viewMode === 'weeks' ? 90 : 180;
  
  if (totalDays < minimumDays) {
    const additionalDays = minimumDays - totalDays;
    start.setDate(start.getDate() - Math.floor(additionalDays / 2));
    end.setDate(end.getDate() + Math.ceil(additionalDays / 2));
  }

  return { start, end };
};

export const useGanttChart = ({ projectId }: UseGanttChartProps) => {
  const { tasks, loading, error } = useTasks();
  const { projects } = useProjects();
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

  // Get selected project data
  const selectedProject = projectId && projectId !== 'all' 
    ? projects.find(p => p.id === projectId) 
    : null;

  // Drag and drop functionality
  const dragAndDrop = useDragAndDrop(timelineStart, timelineEnd, viewMode);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    setProjectTasks(filtered);
  }, [tasks, projectId]);

  // Calculate timeline bounds when tasks, view mode, or project changes
  useEffect(() => {
    const { start, end } = calculateTimelineRange(projectTasks, viewMode, selectedProject);
    setTimelineStart(start);
    setTimelineEnd(end);
  }, [projectTasks, viewMode, selectedProject]);

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
