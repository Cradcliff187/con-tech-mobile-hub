
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './dateUtils';
import { startOfDay, isSameDay, startOfWeek, isSameWeek, startOfMonth, isSameMonth, addDays, addWeeks, addMonths, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

export interface TaskGridPosition {
  startColumnIndex: number;
  columnSpan: number;
}

export interface TimelineUnit {
  key: number;
  label: string;
  isWeekend: boolean;
}

// Generate timeline units based on view mode with consistent date normalization
export const generateTimelineUnits = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  // Normalize start date to ensure consistent comparison
  const normalizedStart = startOfDay(timelineStart);
  const normalizedEnd = startOfDay(timelineEnd);
  
  switch (viewMode) {
    case 'days': {
      let current = normalizedStart;
      while (current <= normalizedEnd) {
        units.push({
          key: current.getTime(),
          label: current.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          isWeekend: current.getDay() === 0 || current.getDay() === 6
        });
        current = addDays(current, 1);
      }
      break;
    }
    
    case 'weeks': {
      // Use consistent week boundary calculation with startOfWeek
      let current = startOfWeek(normalizedStart, { weekStartsOn: 0 }); // Sunday-based weeks
      const endWeek = startOfWeek(normalizedEnd, { weekStartsOn: 0 });
      
      while (current <= endWeek) {
        units.push({
          key: current.getTime(),
          label: current.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          isWeekend: false
        });
        current = addWeeks(current, 1);
      }
      break;
    }
    
    case 'months': {
      let current = startOfMonth(normalizedStart);
      const endMonth = startOfMonth(normalizedEnd);
      
      while (current <= endMonth) {
        units.push({
          key: current.getTime(),
          label: current.toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
          }),
          isWeekend: false
        });
        current = addMonths(current, 1);
      }
      break;
    }
  }
  
  return units;
};

// Find which column index a date falls into with improved edge case handling
export const getColumnIndexForDate = (
  date: Date,
  timelineUnits: TimelineUnit[],
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  // Normalize the target date to start of day for consistent comparison
  const normalizedDate = startOfDay(date);
  
  // Handle edge case: empty timeline
  if (timelineUnits.length === 0) return 0;
  
  const firstUnitDate = startOfDay(new Date(timelineUnits[0].key));
  const lastUnitDate = startOfDay(new Date(timelineUnits[timelineUnits.length - 1].key));
  
  // Handle edge case: date before timeline start
  if (normalizedDate < firstUnitDate) return 0;
  
  // Handle edge case: date after timeline end - return last valid index
  if (viewMode === 'days' && normalizedDate > lastUnitDate) {
    return timelineUnits.length - 1;
  }
  if (viewMode === 'weeks' && normalizedDate > addWeeks(lastUnitDate, 1)) {
    return timelineUnits.length - 1;
  }
  if (viewMode === 'months' && normalizedDate > addMonths(lastUnitDate, 1)) {
    return timelineUnits.length - 1;
  }

  // Find the correct column index using consistent date logic
  for (let i = 0; i < timelineUnits.length; i++) {
    const unitDate = startOfDay(new Date(timelineUnits[i].key));
    
    switch (viewMode) {
      case 'days':
        if (isSameDay(normalizedDate, unitDate)) {
          return i;
        }
        break;
        
      case 'weeks': {
        // Use the same week boundary logic as timeline generation
        const columnWeekStart = startOfWeek(unitDate, { weekStartsOn: 0 });
        
        // Check if the target date falls within this week
        if (isSameWeek(normalizedDate, columnWeekStart, { weekStartsOn: 0 })) {
          return i;
        }
        break;
      }
        
      case 'months':
        if (isSameMonth(normalizedDate, unitDate)) {
          return i;
        }
        break;
    }
  }
  
  // Fallback: return closest valid index based on position
  if (normalizedDate < firstUnitDate) return 0;
  return timelineUnits.length - 1;
};

// Grid-aware duration calculation that counts actual timeline columns
export const calculateDurationInUnits = (
  startDate: Date,
  endDate: Date,
  viewMode: 'days' | 'weeks' | 'months',
  timelineStart: Date,
  timelineEnd: Date
): number => {
  // Generate timeline units to match the actual grid
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  // Get column indices for start and end dates
  const startColumnIndex = getColumnIndexForDate(startDate, timelineUnits, viewMode);
  const endColumnIndex = getColumnIndexForDate(endDate, timelineUnits, viewMode);
  
  // Calculate span as the difference in column indices, minimum 1
  const columnSpan = Math.max(1, endColumnIndex - startColumnIndex + 1);
  
  // For validation, also calculate using date-fns for comparison
  const dateFnsDuration = (() => {
    const normalizedStart = startOfDay(startDate);
    const normalizedEnd = startOfDay(endDate);
    
    switch (viewMode) {
      case 'days':
        return Math.max(1, differenceInDays(normalizedEnd, normalizedStart) + 1);
      case 'weeks':
        return Math.max(1, differenceInWeeks(normalizedEnd, normalizedStart) + 1);
      case 'months':
        return Math.max(1, differenceInMonths(normalizedEnd, normalizedStart) + 1);
    }
  })();
  
  // Use the grid-based calculation, but validate against date-fns result
  const finalDuration = Math.max(1, Math.min(columnSpan, timelineUnits.length));
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Duration calculation:', {
      viewMode,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startColumnIndex,
      endColumnIndex,
      columnSpan,
      dateFnsDuration,
      finalDuration
    });
  }
  
  return finalDuration;
};

// Get task grid position with validation and improved calculations
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
  
  // Use grid-aware duration calculation
  const columnSpan = calculateDurationInUnits(
    calculatedStartDate, 
    calculatedEndDate, 
    viewMode,
    timelineStart,
    timelineEnd
  );
  
  // Validate and clamp positions to valid grid bounds
  const clampedStartIndex = Math.max(0, Math.min(startColumnIndex, timelineUnits.length - 1));
  const maxAllowedSpan = timelineUnits.length - clampedStartIndex;
  const clampedSpan = Math.max(1, Math.min(columnSpan, maxAllowedSpan));

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Task grid position:', {
      taskId: task.id,
      title: task.title,
      viewMode,
      calculatedStartDate: calculatedStartDate.toISOString(),
      calculatedEndDate: calculatedEndDate.toISOString(),
      timelineUnitsLength: timelineUnits.length,
      startColumnIndex,
      columnSpan,
      clampedStartIndex,
      clampedSpan
    });
  }

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
