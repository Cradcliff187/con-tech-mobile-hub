
import { GanttAction } from './types';
import { Task } from '@/types/database';

// Action creators for Gantt state management
export const createGanttActions = {
  setTasks: (tasks: Task[]): GanttAction => ({
    type: 'SET_TASKS',
    payload: tasks,
  }),

  updateTask: (task: Task): GanttAction => ({
    type: 'UPDATE_TASK',
    payload: task,
  }),

  addTask: (task: Task): GanttAction => ({
    type: 'ADD_TASK',
    payload: task,
  }),

  removeTask: (taskId: string): GanttAction => ({
    type: 'REMOVE_TASK',
    payload: taskId,
  }),

  setViewMode: (viewMode: 'days' | 'weeks' | 'months'): GanttAction => ({
    type: 'SET_VIEW_MODE',
    payload: viewMode,
  }),

  setTimelineRange: (startDate: Date, endDate: Date): GanttAction => ({
    type: 'SET_TIMELINE_RANGE',
    payload: { startDate, endDate },
  }),

  setSelectedTask: (taskId: string | null): GanttAction => ({
    type: 'SET_SELECTED_TASK',
    payload: taskId,
  }),

  setDraggedTask: (taskId: string | null): GanttAction => ({
    type: 'SET_DRAGGED_TASK',
    payload: taskId,
  }),

  setScrollPosition: (scrollLeft: number): GanttAction => ({
    type: 'SET_SCROLL_POSITION',
    payload: scrollLeft,
  }),

  setFilters: (filters: any): GanttAction => ({
    type: 'SET_FILTERS',
    payload: filters,
  }),
};
