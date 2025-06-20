
import { useCallback } from 'react';
import { useGanttContext } from './useGanttContext';
import { createGanttActions } from './actions';
import { Task } from '@/types/database';
import { GanttState } from './types';

// Custom hooks for common Gantt operations
export const useGanttActions = () => {
  const { dispatch } = useGanttContext();

  const actions = useCallback(() => ({
    setTasks: (tasks: Task[]) => dispatch(createGanttActions.setTasks(tasks)),
    updateTask: (id: string, updates: Partial<Task>) => dispatch(createGanttActions.updateTask(id, updates)),
    addTask: (task: Task) => dispatch(createGanttActions.addTask(task)),
    removeTask: (taskId: string) => dispatch(createGanttActions.removeTask(taskId)),
    setViewMode: (viewMode: 'days' | 'weeks' | 'months') => dispatch(createGanttActions.setViewMode(viewMode)),
    setTimelineRange: (startDate: Date, endDate: Date) => dispatch(createGanttActions.setTimelineRange(startDate, endDate)),
    setSelectedTask: (taskId: string | null) => dispatch(createGanttActions.setSelectedTask(taskId)),
    setDragState: (dragState: Partial<GanttState['dragState']>) => dispatch(createGanttActions.setDragState(dragState)),
    setFilters: (filters: Partial<GanttState['filters']>) => dispatch(createGanttActions.setFilters(filters)),
  }), [dispatch]);

  return actions();
};

export const useGanttState = () => {
  const { state } = useGanttContext();
  return state;
};
