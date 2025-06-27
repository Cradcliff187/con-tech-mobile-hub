
import { differenceInDays, addDays } from 'date-fns';
import { Task } from '@/types/database';

// Standardized column widths for each view mode
export const VIEW_MODE_CONFIG = {
  days: { columnWidth: 40, label: 'Day' },
  weeks: { columnWidth: 80, label: 'Week' },
  months: { columnWidth: 120, label: 'Month' }
} as const;

// Standardized row heights
export const ROW_HEIGHT = 40; // px
export const TASK_BAR_HEIGHT = 32; // px
export const TASK_BAR_MARGIN = 4; // px (top margin)

// Get column width for view mode
export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  return VIEW_MODE_CONFIG[viewMode].columnWidth;
};

// Calculate task position in pixels from timeline start
export const getTaskPixelPosition = (
  taskStartDate: Date,
  timelineStart: Date,
  dayWidth: number
): number => {
  const daysDiff = differenceInDays(taskStartDate, timelineStart);
  return Math.max(0, daysDiff * dayWidth);
};

// Calculate task width in pixels
export const getTaskPixelWidth = (
  taskStartDate: Date,
  taskEndDate: Date,
  dayWidth: number
): number => {
  const duration = differenceInDays(taskEndDate, taskStartDate) + 1;
  return Math.max(dayWidth, duration * dayWidth);
};

// Calculate total timeline width in pixels
export const getTimelinePixelWidth = (
  timelineStart: Date,
  timelineEnd: Date,
  dayWidth: number
): number => {
  const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;
  return totalDays * dayWidth;
};

// Convert pixel position back to date
export const getDateFromPixelPosition = (
  pixelX: number,
  timelineStart: Date,
  dayWidth: number
): Date => {
  const dayOffset = Math.round(pixelX / dayWidth);
  return addDays(timelineStart, dayOffset);
};

// Get task dates from estimate for consistent date handling
export const getTaskDates = (task: Task) => {
  const startDate = task.start_date ? new Date(task.start_date) : new Date();
  const endDate = task.due_date ? new Date(task.due_date) : addDays(startDate, 1);
  return { startDate, endDate };
};
