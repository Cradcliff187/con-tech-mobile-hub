
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';

export const useTimelineCalculation = (tasks: Task[]) => {
  const { timelineStart, timelineEnd } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      // Default to current month view if no tasks
      const now = new Date();
      const start = startOfDay(subDays(now, 15));
      const end = endOfDay(addDays(now, 45));
      return { timelineStart: start, timelineEnd: end };
    }

    // Get all task dates, filtering out null values
    const taskDates = tasks
      .flatMap(task => [task.start_date, task.due_date])
      .filter((date): date is string => date !== null && date !== undefined)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime())); // Filter out invalid dates

    if (taskDates.length === 0) {
      // No valid dates found, use default range
      const now = new Date();
      const start = startOfDay(subDays(now, 15));
      const end = endOfDay(addDays(now, 45));
      return { timelineStart: start, timelineEnd: end };
    }

    // Find min and max dates
    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));

    // Add padding to timeline bounds
    const timelineStart = startOfDay(subDays(minDate, 7));
    const timelineEnd = endOfDay(addDays(maxDate, 14));

    return {
      timelineStart,
      timelineEnd
    };
  }, [tasks]);

  return {
    timelineStart,
    timelineEnd
  };
};
