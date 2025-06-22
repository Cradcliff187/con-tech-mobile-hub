
import { useCallback, useEffect, useMemo } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { applyTaskFilters } from './utils';
import { GanttState, GanttAction } from './types';
import { subDays, addDays, subWeeks, addWeeks, subMonths, addMonths } from 'date-fns';
import { calculateTaskDatesFromEstimate } from '@/components/planning/gantt/utils/dateUtils';

interface UseGanttDataManagerProps {
  projectId?: string;
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
}

export const useGanttDataManager = ({ projectId, state, dispatch }: UseGanttDataManagerProps) => {
  // Fetch tasks using the useTasks hook
  const { tasks: fetchedTasks, loading, error } = useTasks({ 
    projectId: projectId && projectId !== 'all' ? projectId : undefined 
  });

  // Memoize filtered tasks calculation for performance
  const filteredTasks = useMemo(() => {
    return applyTaskFilters(
      state.tasks,
      state.optimisticUpdates,
      state.searchQuery,
      state.filters
    );
  }, [state.tasks, state.optimisticUpdates, state.searchQuery, state.filters]);

  // Update tasks in state when fetched tasks change
  useEffect(() => {
    if (fetchedTasks && fetchedTasks.length > 0) {
      dispatch({ type: 'SET_TASKS', payload: fetchedTasks });
    }
    dispatch({ type: 'SET_LOADING', payload: loading });
    dispatch({ type: 'SET_ERROR', payload: error || null });
  }, [fetchedTasks, loading, error, dispatch]);

  // Calculate timeline bounds that include all tasks
  // Fixed: Use primitive dependencies instead of filteredTasks to prevent infinite loop
  useEffect(() => {
    const today = new Date(2025, 5, 18); // June 18, 2025 (month is 0-indexed)
    let start: Date;
    let end: Date;

    // First set view-based ranges
    switch (state.viewMode) {
      case 'days':
        start = subDays(today, 7);
        end = addDays(today, 7);
        break;
      case 'weeks':
        start = subWeeks(today, 2);
        end = addWeeks(today, 2);
        break;
      case 'months':
        start = subMonths(today, 1);
        end = addMonths(today, 1);
        break;
      default:
        start = subWeeks(today, 2);
        end = addWeeks(today, 2);
    }

    // Only calculate task dates if we have tasks
    if (state.tasks.length > 0) {
      try {
        const taskDates = state.tasks.flatMap(task => {
          const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
          return [calculatedStartDate, calculatedEndDate];
        });
        
        if (taskDates.length > 0) {
          const earliestTask = new Date(Math.min(...taskDates.map(d => d.getTime())));
          const latestTask = new Date(Math.max(...taskDates.map(d => d.getTime())));
          
          // Expand timeline if tasks are outside current bounds
          if (earliestTask < start) {
            start = subDays(earliestTask, 7); // Add padding
          }
          if (latestTask > end) {
            end = addDays(latestTask, 7); // Add padding
          }
        }
      } catch (error) {
        console.log('Error calculating task dates for timeline:', error);
        // Continue with default timeline bounds
      }
    }

    // Only dispatch if bounds actually changed
    const currentStart = state.timelineStart?.getTime();
    const currentEnd = state.timelineEnd?.getTime();
    const newStartTime = start.getTime();
    const newEndTime = end.getTime();

    if (currentStart !== newStartTime || currentEnd !== newEndTime) {
      dispatch({ type: 'SET_TIMELINE_BOUNDS', payload: { start, end } });
    }
  }, [state.viewMode, state.tasks, state.timelineStart, state.timelineEnd, dispatch]);

  return {
    filteredTasks
  };
};
