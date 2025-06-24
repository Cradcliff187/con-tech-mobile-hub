
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

export const useTimelineCalculation = (tasks: Task[]) => {
  const { timelineStart, timelineEnd } = useMemo(() => {
    if (tasks.length === 0) {
      // Default to current date plus/minus 30 days
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      const end = new Date(today);
      end.setDate(today.getDate() + 90);
      
      return {
        timelineStart: start,
        timelineEnd: end
      };
    }

    const dates = tasks.flatMap(task => {
      const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      return [calculatedStartDate, calculatedEndDate];
    });

    if (dates.length === 0) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      const end = new Date(today);
      end.setDate(today.getDate() + 90);
      
      return {
        timelineStart: start,
        timelineEnd: end
      };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add some padding to the timeline
    const paddingDays = 7;
    const timelineStart = new Date(minDate);
    timelineStart.setDate(minDate.getDate() - paddingDays);
    
    const timelineEnd = new Date(maxDate);
    timelineEnd.setDate(maxDate.getDate() + paddingDays);

    return {
      timelineStart,
      timelineEnd
    };
  }, [tasks]);

  return { timelineStart, timelineEnd };
};
