
import { startOfDay, startOfWeek, startOfMonth, addDays, addWeeks, addMonths, format, differenceInDays } from 'date-fns';
import { Task } from '@/types/database';

// Core configuration for each view mode
export const GRID_CONFIG = {
  days: { 
    columnWidth: 40, 
    label: 'Day',
    format: 'MMM d'
  },
  weeks: { 
    columnWidth: 80, 
    label: 'Week',
    format: 'MMM d'
  },
  months: { 
    columnWidth: 120, 
    label: 'Month',
    format: 'MMM yyyy'
  }
} as const;

// Standard row dimensions
export const ROW_CONFIG = {
  height: 40,
  taskBarHeight: 32,
  taskBarMargin: 4
} as const;

export interface TimelineColumn {
  key: string;
  label: string;
  date: Date;
  position: number;
  width: number;
}

export interface TimelineBounds {
  start: Date;
  end: Date;
  totalColumns: number;
  totalWidth: number;
}

// Get properly aligned timeline bounds based on view mode
export const getTimelineBounds = (tasks: Task[], viewMode: 'days' | 'weeks' | 'months'): TimelineBounds => {
  const now = new Date();
  
  if (!tasks || tasks.length === 0) {
    // Default range when no tasks exist
    const start = getViewModeStart(now, viewMode);
    const columns = generateTimelineColumns(start, addDays(start, 60), viewMode);
    return {
      start,
      end: columns[columns.length - 1]?.date || start,
      totalColumns: columns.length,
      totalWidth: columns.length * GRID_CONFIG[viewMode].columnWidth
    };
  }

  // Find actual task date range
  const taskDates = tasks
    .flatMap(task => [task.start_date, task.due_date])
    .filter((date): date is string => date !== null && date !== undefined)
    .map(date => new Date(date))
    .filter(date => !isNaN(date.getTime()));

  if (taskDates.length === 0) {
    // No valid dates, use default range
    const start = getViewModeStart(now, viewMode);
    const columns = generateTimelineColumns(start, addDays(start, 60), viewMode);
    return {
      start,
      end: columns[columns.length - 1]?.date || start,
      totalColumns: columns.length,
      totalWidth: columns.length * GRID_CONFIG[viewMode].columnWidth
    };
  }

  const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));

  // Align bounds to view mode boundaries with padding
  const paddedStart = addDays(minDate, -7);
  const paddedEnd = addDays(maxDate, 14);
  
  const alignedStart = getViewModeStart(paddedStart, viewMode);
  const alignedEnd = getViewModeEnd(paddedEnd, viewMode);

  const columns = generateTimelineColumns(alignedStart, alignedEnd, viewMode);
  
  return {
    start: alignedStart,
    end: alignedEnd,
    totalColumns: columns.length,
    totalWidth: columns.length * GRID_CONFIG[viewMode].columnWidth
  };
};

// Get the start boundary for a date based on view mode
const getViewModeStart = (date: Date, viewMode: 'days' | 'weeks' | 'months'): Date => {
  switch (viewMode) {
    case 'days':
      return startOfDay(date);
    case 'weeks':
      return startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    case 'months':
      return startOfMonth(date);
  }
};

// Get the end boundary for a date based on view mode
const getViewModeEnd = (date: Date, viewMode: 'days' | 'weeks' | 'months'): Date => {
  switch (viewMode) {
    case 'days':
      return addDays(getViewModeStart(date, viewMode), 30); // 30 days from aligned start
    case 'weeks':
      return addWeeks(getViewModeStart(date, viewMode), 12); // 12 weeks from aligned start
    case 'months':
      return addMonths(getViewModeStart(date, viewMode), 6); // 6 months from aligned start
  }
};

// Generate timeline columns with proper iteration
export const generateTimelineColumns = (
  startDate: Date, 
  endDate: Date, 
  viewMode: 'days' | 'weeks' | 'months'
): TimelineColumn[] => {
  const columns: TimelineColumn[] = [];
  const config = GRID_CONFIG[viewMode];
  
  let currentDate = getViewModeStart(startDate, viewMode);
  let position = 0;
  
  while (currentDate <= endDate) {
    const column: TimelineColumn = {
      key: currentDate.toISOString(),
      label: format(currentDate, config.format),
      date: new Date(currentDate),
      position,
      width: config.columnWidth
    };
    
    columns.push(column);
    position += config.columnWidth;
    
    // Advance to next period
    switch (viewMode) {
      case 'days':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weeks':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'months':
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }
  
  return columns;
};

// Get column index for a specific date
export const getColumnIndexForDate = (
  targetDate: Date,
  timelineBounds: TimelineBounds,
  viewMode: 'days' | 'weeks' | 'months'
): number => {
  const alignedTarget = getViewModeStart(targetDate, viewMode);
  const alignedStart = getViewModeStart(timelineBounds.start, viewMode);
  
  let daysDiff: number;
  
  switch (viewMode) {
    case 'days':
      daysDiff = differenceInDays(alignedTarget, alignedStart);
      return Math.max(0, Math.min(daysDiff, timelineBounds.totalColumns - 1));
    case 'weeks':
      daysDiff = differenceInDays(alignedTarget, alignedStart);
      return Math.max(0, Math.min(Math.floor(daysDiff / 7), timelineBounds.totalColumns - 1));
    case 'months':
      // For months, calculate based on month difference
      const yearDiff = alignedTarget.getFullYear() - alignedStart.getFullYear();
      const monthDiff = alignedTarget.getMonth() - alignedStart.getMonth();
      const totalMonthDiff = yearDiff * 12 + monthDiff;
      return Math.max(0, Math.min(totalMonthDiff, timelineBounds.totalColumns - 1));
  }
};

// Calculate task position and width
export interface TaskGridPosition {
  startColumn: number;
  columnSpan: number;
  pixelLeft: number;
  pixelWidth: number;
}

export const getTaskGridPosition = (
  task: Task,
  timelineBounds: TimelineBounds,
  viewMode: 'days' | 'weeks' | 'months'
): TaskGridPosition => {
  const startDate = task.start_date ? new Date(task.start_date) : new Date();
  const endDate = task.due_date ? new Date(task.due_date) : addDays(startDate, 1);
  
  const startColumn = getColumnIndexForDate(startDate, timelineBounds, viewMode);
  const endColumn = getColumnIndexForDate(endDate, timelineBounds, viewMode);
  
  const columnSpan = Math.max(1, endColumn - startColumn + 1);
  const columnWidth = GRID_CONFIG[viewMode].columnWidth;
  
  return {
    startColumn,
    columnSpan,
    pixelLeft: startColumn * columnWidth,
    pixelWidth: columnSpan * columnWidth
  };
};

// Today indicator position
export const getTodayIndicatorPosition = (
  timelineBounds: TimelineBounds,
  viewMode: 'days' | 'weeks' | 'months'
): number | null => {
  const today = new Date();
  const todayColumn = getColumnIndexForDate(today, timelineBounds, viewMode);
  
  if (todayColumn < 0 || todayColumn >= timelineBounds.totalColumns) {
    return null; // Today is outside visible range
  }
  
  const columnWidth = GRID_CONFIG[viewMode].columnWidth;
  return todayColumn * columnWidth + columnWidth / 2;
};
