
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './dateUtils';
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth,
  addDays, 
  addWeeks, 
  addMonths,
  isSameDay,
  isSameWeek,
  isSameMonth,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths
} from 'date-fns';

export interface TaskGridPosition {
  startColumnIndex: number;
  columnSpan: number;
}

export interface TimelineUnit {
  key: number;
  label: string;
  isWeekend: boolean;
}

// Consolidated timeline generation - SINGLE SOURCE OF TRUTH
export const generateTimelineUnits = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  
  // Normalize dates to avoid boundary issues
  let current: Date;
  let end: Date;
  
  switch (viewMode) {
    case 'days':
      current = startOfDay(timelineStart);
      end = startOfDay(timelineEnd);
      
      while (current <= end) {
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
      
    case 'weeks':
      // Use Monday as week start for consistency
      current = startOfWeek(timelineStart, { weekStartsOn: 1 });
      end = startOfWeek(timelineEnd, { weekStartsOn: 1 });
      
      while (current <= end) {
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
      
    case 'months':
      current = startOfMonth(timelineStart);
      end = startOfMonth(timelineEnd);
      
      while (current <= end) {
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
  
  console.log('🎯 Generated timeline units:', {
    viewMode,
    startDate: timelineStart.toISOString(),
    endDate: timelineEnd.toISOString(),
    unitsCount: units.length,
    firstUnit: units[0]?.label,
    lastUnit: units[units.length - 1]?.label
  });
  
  return units;
};

// Fixed column width mapping - SINGLE SOURCE OF TRUTH
export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': return 64; // w-16
    case 'weeks': return 80; // w-20  
    case 'months': return 96; // w-24
  }
};

// Improved column index calculation with proper date normalization
export const getColumnIndexForDate = (
  date: Date,
  timelineUnits: TimelineUnit[],
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  if (timelineUnits.length === 0) return 0;
  
  const normalizedDate = startOfDay(date);
  
  for (let i = 0; i < timelineUnits.length; i++) {
    const unitDate = new Date(timelineUnits[i].key);
    
    switch (viewMode) {
      case 'days':
        if (isSameDay(normalizedDate, unitDate)) {
          return i;
        }
        break;
        
      case 'weeks':
        if (isSameWeek(normalizedDate, unitDate, { weekStartsOn: 1 })) {
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
  
  // Edge case handling
  const firstUnitDate = new Date(timelineUnits[0].key);
  const lastUnitDate = new Date(timelineUnits[timelineUnits.length - 1].key);
  
  if (normalizedDate < firstUnitDate) return 0;
  if (normalizedDate > lastUnitDate) return timelineUnits.length - 1;
  
  return 0;
};

// Simplified duration calculation using consolidated timeline
export const calculateDurationInUnits = (
  startDate: Date,
  endDate: Date,
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  const normalizedStart = startOfDay(startDate);
  const normalizedEnd = startOfDay(endDate);
  
  let duration: number;
  
  switch (viewMode) {
    case 'days':
      duration = Math.max(1, differenceInDays(normalizedEnd, normalizedStart) + 1);
      break;
    case 'weeks':
      duration = Math.max(1, differenceInWeeks(normalizedEnd, normalizedStart) + 1);
      break;
    case 'months':
      duration = Math.max(1, differenceInMonths(normalizedEnd, normalizedStart) + 1);
      break;
  }
  
  console.log('🎯 Duration calculation:', {
    viewMode,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    duration
  });
  
  return duration;
};

// Fixed task grid positioning using consolidated system
export const getTaskGridPosition = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TaskGridPosition => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  
  // Generate timeline units for consistent calculation
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  // Get start column index
  const startColumnIndex = getColumnIndexForDate(calculatedStartDate, timelineUnits, viewMode);
  
  // Calculate duration in timeline units
  const columnSpan = calculateDurationInUnits(calculatedStartDate, calculatedEndDate, viewMode);
  
  // Clamp to valid bounds
  const clampedStartIndex = Math.max(0, Math.min(startColumnIndex, timelineUnits.length - 1));
  const maxAllowedSpan = timelineUnits.length - clampedStartIndex;
  const clampedSpan = Math.max(1, Math.min(columnSpan, maxAllowedSpan));

  console.log('🎯 Task grid position:', {
    taskId: task.id,
    title: task.title.substring(0, 30),
    viewMode,
    startDate: calculatedStartDate.toISOString(),
    endDate: calculatedEndDate.toISOString(),
    startColumnIndex: clampedStartIndex,
    columnSpan: clampedSpan,
    timelineUnitsCount: timelineUnits.length
  });

  return {
    startColumnIndex: clampedStartIndex,
    columnSpan: clampedSpan
  };
};
