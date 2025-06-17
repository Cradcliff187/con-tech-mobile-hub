
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
  // **ENHANCED: More pronounced view mode differences**
  const getViewModeConfig = (mode: 'days' | 'weeks' | 'months') => {
    switch (mode) {
      case 'days':
        return {
          paddingDays: 14,           // 2 weeks padding
          minimumDays: 45,           // 1.5 months minimum
          bufferMultiplier: 0.1      // 10% of project duration
        };
      case 'weeks':
        return {
          paddingDays: 21,           // 3 weeks padding  
          minimumDays: 90,           // 3 months minimum
          bufferMultiplier: 0.15     // 15% of project duration
        };
      case 'months':
        return {
          paddingDays: 45,           // 6+ weeks padding
          minimumDays: 180,          // 6 months minimum
          bufferMultiplier: 0.25     // 25% of project duration
        };
      default:
        return {
          paddingDays: 21,
          minimumDays: 90,
          bufferMultiplier: 0.15
        };
    }
  };

  const config = getViewModeConfig(viewMode);

  // **PHASE 1: PRIMARY - Use project start/end dates with enhanced calculation**
  if (selectedProject?.start_date && selectedProject?.end_date) {
    const projectStart = new Date(selectedProject.start_date);
    const projectEnd = new Date(selectedProject.end_date);
    
    // Check task boundaries
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
    
    // Use broader range with view-mode specific padding
    const timelineStart = earliestTaskDate < projectStart ? earliestTaskDate : projectStart;
    const timelineEnd = latestTaskDate > projectEnd ? latestTaskDate : projectEnd;
    
    const start = new Date(timelineStart);
    start.setDate(start.getDate() - config.paddingDays);
    
    const end = new Date(timelineEnd);
    end.setDate(end.getDate() + config.paddingDays);
    
    // Ensure minimum span
    const totalDays = getDaysBetween(start, end);
    if (totalDays < config.minimumDays) {
      const additionalDays = config.minimumDays - totalDays;
      start.setDate(start.getDate() - Math.floor(additionalDays / 2));
      end.setDate(end.getDate() + Math.ceil(additionalDays / 2));
    }
    
    return { start, end };
  }
  
  // **FALLBACK: Enhanced task-based calculation**
  if (tasks.length === 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - config.paddingDays);
    const end = new Date(now);
    end.setDate(end.getDate() + config.minimumDays);
    return { start, end };
  }

  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Process all tasks to find actual date ranges
  tasks.forEach(task => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    
    if (!minDate || calculatedStartDate < minDate) minDate = calculatedStartDate;
    if (!maxDate || calculatedEndDate > maxDate) maxDate = calculatedEndDate;
  });

  if (!minDate || !maxDate) {
    const now = new Date();
    minDate = new Date(now);
    minDate.setDate(minDate.getDate() - config.paddingDays);
    maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + config.minimumDays);
  }

  // Calculate intelligent padding based on project duration
  const projectDurationDays = getDaysBetween(minDate, maxDate);
  const dynamicPadding = Math.max(
    config.paddingDays, 
    Math.min(config.paddingDays * 3, projectDurationDays * config.bufferMultiplier)
  );

  const start = new Date(minDate);
  start.setDate(start.getDate() - dynamicPadding);
  
  const end = new Date(maxDate);
  end.setDate(end.getDate() + dynamicPadding);

  // Ensure minimum timeline span
  const totalDays = getDaysBetween(start, end);
  if (totalDays < config.minimumDays) {
    const additionalDays = config.minimumDays - totalDays;
    start.setDate(start.getDate() - Math.floor(additionalDays / 2));
    end.setDate(end.getDate() + Math.ceil(additionalDays / 2));
  }

  // **ENHANCED: View mode specific boundary adjustments**
  if (viewMode === 'weeks') {
    // Align to week boundaries (Sunday start)
    const startDay = start.getDay();
    if (startDay !== 0) {
      start.setDate(start.getDate() - startDay);
    }
    const endDay = end.getDay();
    if (endDay !== 6) {
      end.setDate(end.getDate() + (6 - endDay));
    }
  } else if (viewMode === 'months') {
    // Align to month boundaries
    start.setDate(1); // First day of month
    end.setMonth(end.getMonth() + 1, 0); // Last day of month
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

  // **ENHANCED: Recalculate timeline when view mode changes**
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
