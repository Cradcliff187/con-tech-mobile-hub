
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './dateUtils';

export interface TaskGridPosition {
  startColumnIndex: number;
  columnSpan: number;
}

export interface TimelineUnit {
  key: number;
  label: string;
  isWeekend: boolean;
}

// Generate timeline units based on view mode (same logic as used in components)
export const generateTimelineUnits = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  const current = new Date(timelineStart);
  
  while (current <= timelineEnd) {
    switch (viewMode) {
      case 'days':
        units.push({
          key: current.getTime(),
          label: current.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          isWeekend: current.getDay() === 0 || current.getDay() === 6
        });
        current.setDate(current.getDate() + 1);
        break;
        
      case 'weeks':
        // Start of week (Sunday)
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        units.push({
          key: weekStart.getTime(),
          label: weekStart.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          isWeekend: false
        });
        current.setDate(current.getDate() + 7);
        break;
        
      case 'months':
        units.push({
          key: current.getTime(),
          label: current.toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
          }),
          isWeekend: false
        });
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return units;
};

// Find which column index a date falls into
export const getColumnIndexForDate = (
  date: Date,
  timelineUnits: TimelineUnit[],
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  for (let i = 0; i < timelineUnits.length; i++) {
    const unitDate = new Date(timelineUnits[i].key);
    
    switch (viewMode) {
      case 'days':
        if (date.toDateString() === unitDate.toDateString()) {
          return i;
        }
        break;
        
      case 'weeks':
        const weekEnd = new Date(unitDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (date >= unitDate && date <= weekEnd) {
          return i;
        }
        break;
        
      case 'months':
        if (date.getMonth() === unitDate.getMonth() && date.getFullYear() === unitDate.getFullYear()) {
          return i;
        }
        break;
    }
  }
  
  // If not found, return closest index
  if (date < new Date(timelineUnits[0].key)) return 0;
  return timelineUnits.length - 1;
};

// Calculate duration in timeline units
export const calculateDurationInUnits = (
  startDate: Date,
  endDate: Date,
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  switch (viewMode) {
    case 'days':
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
    case 'weeks':
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
    case 'months':
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
      return Math.max(1, Math.ceil(monthsDiff));
  }
};

// Get task grid position based on timeline columns
export const getTaskGridPosition = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TaskGridPosition => {
  // Get task dates using existing calculateTaskDatesFromEstimate
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  
  // Generate timeline units for this calculation
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  // Calculate which column index the task starts in
  const startColumnIndex = getColumnIndexForDate(calculatedStartDate, timelineUnits, viewMode);
  
  // Calculate how many columns it spans
  const columnSpan = Math.max(1, calculateDurationInUnits(calculatedStartDate, calculatedEndDate, viewMode));
  
  return {
    startColumnIndex,
    columnSpan
  };
};

// Get column width in pixels for each view mode
export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': 
      return 96; // w-24 = 6rem = 96px
    case 'weeks': 
      return 128; // w-32 = 8rem = 128px
    case 'months': 
      return 160; // w-40 = 10rem = 160px
  }
};
