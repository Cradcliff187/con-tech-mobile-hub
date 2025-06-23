import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './dateUtils';
import { startOfDay, isSameDay, startOfWeek, isSameWeek, startOfMonth, isSameMonth, addWeeks, addMonths } from 'date-fns';

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
  // Normalize the target date to start of day for consistent comparison
  const normalizedDate = startOfDay(date);
  
  // Handle edge case: date before timeline start
  if (timelineUnits.length === 0) return 0;
  
  const firstUnitDate = startOfDay(new Date(timelineUnits[0].key));
  if (normalizedDate < firstUnitDate) return 0;
  
  // Handle edge case: date after timeline end
  const lastUnitDate = startOfDay(new Date(timelineUnits[timelineUnits.length - 1].key));
  if (viewMode === 'days' && normalizedDate > lastUnitDate) {
    return timelineUnits.length - 1;
  }
  if (viewMode === 'weeks' && normalizedDate > addWeeks(lastUnitDate, 1)) {
    return timelineUnits.length - 1;
  }
  if (viewMode === 'months' && normalizedDate > addMonths(lastUnitDate, 1)) {
    return timelineUnits.length - 1;
  }

  // Find the correct column index
  for (let i = 0; i < timelineUnits.length; i++) {
    const unitDate = startOfDay(new Date(timelineUnits[i].key));
    
    switch (viewMode) {
      case 'days':
        if (isSameDay(normalizedDate, unitDate)) {
          return i;
        }
        break;
        
      case 'weeks':
        // Get the start of the week for this column (Sunday-based)
        const columnWeekStart = startOfWeek(unitDate, { weekStartsOn: 0 });
        
        // Check if the target date falls within this week
        if (isSameWeek(normalizedDate, columnWeekStart, { weekStartsOn: 0 })) {
          return i;
        }
        break;
        
      case 'months':
        if (isSameMonth(normalizedDate, unitDate)) {
          return i;
        }
        break;
    }
  }
  
  // Fallback: return closest valid index
  return Math.min(timelineUnits.length - 1, Math.max(0, timelineUnits.length - 1));
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
  
  // Clamp column indices to valid range
  const clampedStartIndex = Math.max(0, startColumnIndex);
  const clampedEndIndex = Math.min(timelineUnits.length - 1, startColumnIndex + columnSpan);
  const clampedSpan = Math.max(1, clampedEndIndex - clampedStartIndex);

  return {
    startColumnIndex: clampedStartIndex,
    columnSpan: clampedSpan
  };
};

// Get column width in pixels for each view mode - Optimized smaller widths
export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': 
      return 64; // Reduced from 96px to 64px (w-16)
    case 'weeks': 
      return 80; // Reduced from 128px to 80px (w-20)
    case 'months': 
      return 96; // Reduced from 160px to 96px (w-24)
  }
};
