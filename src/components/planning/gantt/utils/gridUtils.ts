
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

export const generateTimelineUnits = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  
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
  
  return units;
};

export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': return 64;
    case 'weeks': return 80;
    case 'months': return 96;
  }
};

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
  
  const firstUnitDate = new Date(timelineUnits[0].key);
  const lastUnitDate = new Date(timelineUnits[timelineUnits.length - 1].key);
  
  if (normalizedDate < firstUnitDate) return 0;
  if (normalizedDate > lastUnitDate) return timelineUnits.length - 1;
  
  return 0;
};

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
  
  return duration;
};

export const getTaskGridPosition = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TaskGridPosition => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  const startColumnIndex = getColumnIndexForDate(calculatedStartDate, timelineUnits, viewMode);
  
  const columnSpan = calculateDurationInUnits(calculatedStartDate, calculatedEndDate, viewMode);
  
  const clampedStartIndex = Math.max(0, Math.min(startColumnIndex, timelineUnits.length - 1));
  const maxAllowedSpan = timelineUnits.length - clampedStartIndex;
  const clampedSpan = Math.max(1, Math.min(columnSpan, maxAllowedSpan));

  return {
    startColumnIndex: clampedStartIndex,
    columnSpan: clampedSpan
  };
};
