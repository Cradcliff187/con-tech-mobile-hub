
import { startOfDay, addDays, addWeeks, addMonths, format, isWeekend } from 'date-fns';
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './dateUtils';

export interface TimelineUnit {
  key: string;
  label: string;
  date: Date;
  isWeekend?: boolean;
}

export interface TaskGridPosition {
  startColumnIndex: number;
  columnSpan: number;
}

export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': return 64; // 16 * 4 = 64px per day
    case 'weeks': return 80; // 20 * 4 = 80px per week  
    case 'months': return 96; // 24 * 4 = 96px per month
    default: return 80;
  }
};

export const generateTimelineUnits = (
  startDate: Date, 
  endDate: Date, 
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  let currentDate = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (currentDate <= end) {
    let label: string;
    let nextDate: Date;

    switch (viewMode) {
      case 'days':
        label = format(currentDate, 'MMM d');
        nextDate = addDays(currentDate, 1);
        break;
      case 'weeks':
        label = format(currentDate, 'MMM d');
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'months':
        label = format(currentDate, 'MMM yyyy');
        nextDate = addMonths(currentDate, 1);
        break;
      default:
        label = format(currentDate, 'MMM d');
        nextDate = addDays(currentDate, 1);
    }

    units.push({
      key: currentDate.toISOString(),
      label,
      date: new Date(currentDate),
      isWeekend: viewMode === 'days' ? isWeekend(currentDate) : false
    });

    currentDate = nextDate;
  }

  return units;
};

// Get the column index for a specific date
export const getColumnIndexForDate = (
  targetDate: Date,
  timelineUnits: TimelineUnit[],
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  if (timelineUnits.length === 0) return -1;
  
  const targetTime = targetDate.getTime();
  
  for (let i = 0; i < timelineUnits.length; i++) {
    const unitDate = new Date(timelineUnits[i].key);
    const nextUnitDate = i < timelineUnits.length - 1 
      ? new Date(timelineUnits[i + 1].key)
      : new Date(unitDate.getTime() + (viewMode === 'days' ? 24 * 60 * 60 * 1000 : 
                                      viewMode === 'weeks' ? 7 * 24 * 60 * 60 * 1000 :
                                      30 * 24 * 60 * 60 * 1000));
    
    if (targetTime >= unitDate.getTime() && targetTime < nextUnitDate.getTime()) {
      return i;
    }
  }
  
  // If date is after all units, return last index
  if (targetTime >= new Date(timelineUnits[timelineUnits.length - 1].key).getTime()) {
    return timelineUnits.length - 1;
  }
  
  return 0; // Default to first column if before all units
};

// Calculate task position within the grid
export const getTaskGridPosition = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TaskGridPosition => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  if (timelineUnits.length === 0) {
    return { startColumnIndex: 0, columnSpan: 1 };
  }
  
  const startColumnIndex = Math.max(0, getColumnIndexForDate(calculatedStartDate, timelineUnits, viewMode));
  const endColumnIndex = Math.max(startColumnIndex, getColumnIndexForDate(calculatedEndDate, timelineUnits, viewMode));
  
  const columnSpan = Math.max(1, endColumnIndex - startColumnIndex + 1);
  
  return {
    startColumnIndex,
    columnSpan
  };
};

// Utility to get date from pixel position
export const getDateFromPixelPosition = (
  pixelX: number,
  containerWidth: number,
  timelineStart: Date,
  timelineEnd: Date
): Date => {
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const positionPercent = pixelX / containerWidth;
  const daysFromStart = positionPercent * totalDays;
  
  return new Date(timelineStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
};
