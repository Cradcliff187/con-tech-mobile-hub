
import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { getDaysBetween, calculateTaskDatesFromEstimate } from '../ganttUtils';

interface UseTimelineCalculationProps {
  projectTasks: Task[];
  viewMode: 'days' | 'weeks' | 'months';
  selectedProject: any;
}

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

export const useTimelineCalculation = ({ 
  projectTasks, 
  viewMode, 
  selectedProject 
}: UseTimelineCalculationProps) => {
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());

  // Calculate timeline bounds when tasks, view mode, or project changes
  useEffect(() => {
    const { start, end } = calculateTimelineRange(projectTasks, viewMode, selectedProject);
    setTimelineStart(start);
    setTimelineEnd(end);
  }, [projectTasks, viewMode, selectedProject]);

  const totalDays = getDaysBetween(timelineStart, timelineEnd);

  return {
    timelineStart,
    timelineEnd,
    totalDays
  };
};
