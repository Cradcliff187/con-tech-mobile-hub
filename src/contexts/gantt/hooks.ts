
import { useCallback } from 'react';
import { useGanttContext } from './useGanttContext';
import { createGanttActions } from './actions';

// Custom hooks for common Gantt operations
export const useGanttActions = () => {
  const { dispatch } = useGanttContext();

  const actions = useCallback(() => ({
    setTasks: (tasks: any[]) => dispatch(createGanttActions.setTasks(tasks)),
    updateTask: (id: string, updates: any) => dispatch(createGanttActions.updateTask(id, updates)),
    addTask: (task: any) => dispatch(createGanttActions.addTask(task)),
    removeTask: (taskId: string) => dispatch(createGanttActions.removeTask(taskId)),
    setViewMode: (viewMode: 'days' | 'weeks' | 'months') => dispatch(createGanttActions.setViewMode(viewMode)),
    setTimelineRange: (startDate: Date, endDate: Date) => dispatch(createGanttActions.setTimelineRange(startDate, endDate)),
    setSelectedTask: (taskId: string | null) => dispatch(createGanttActions.setSelectedTask(taskId)),
    setDragState: (dragState: any) => dispatch(createGanttActions.setDragState(dragState)),
    setFilters: (filters: any) => dispatch(createGanttActions.setFilters(filters)),
  }), [dispatch]);

  return actions();
};

export const useGanttState = () => {
  const { state } = useGanttContext();
  return state;
};
