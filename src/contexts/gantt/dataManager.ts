
import { useCallback, useEffect, useMemo } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { applyTaskFilters, calculateTimelineBounds } from './utils';
import { GanttState, GanttAction } from './types';

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

  // Calculate and update timeline bounds when filtered tasks change
  useEffect(() => {
    if (filteredTasks.length > 0) {
      const { start, end } = calculateTimelineBounds(filteredTasks);
      dispatch({ type: 'SET_TIMELINE_BOUNDS', payload: { start, end } });
    }
  }, [filteredTasks, dispatch]);

  return {
    filteredTasks
  };
};
