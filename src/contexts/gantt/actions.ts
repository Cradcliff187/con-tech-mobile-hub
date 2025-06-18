
import { GanttAction } from './types';
import { Task } from '@/types/database';

// Action creators for Gantt state management
export const createGanttActions = {
  setTasks: (tasks: Task[]): GanttAction => ({
    type: 'SET_TASKS',
    payload: tasks,
  }),

  updateTask: (id: string, updates: Partial<Task>): GanttAction => ({
    type: 'UPDATE_TASK',
    payload: { id, updates },
  }),

  addTask: (task: Task): GanttAction => ({
    type: 'ADD_TASK',
    payload: task,
  }),

  removeTask: (taskId: string): GanttAction => ({
    type: 'DELETE_TASK',
    payload: taskId,
  }),

  setViewMode: (viewMode: 'days' | 'weeks' | 'months'): GanttAction => ({
    type: 'SET_VIEW_MODE',
    payload: viewMode,
  }),

  setTimelineRange: (start: Date, end: Date): GanttAction => ({
    type: 'SET_TIMELINE_BOUNDS',
    payload: { start, end },
  }),

  setSelectedTask: (taskId: string | null): GanttAction => ({
    type: 'SET_SELECTED_TASK',
    payload: taskId,
  }),

  setDragState: (dragState: Partial<any>): GanttAction => ({
    type: 'SET_DRAG_STATE',
    payload: dragState,
  }),

  setFilters: (filters: any): GanttAction => ({
    type: 'SET_FILTERS',
    payload: filters,
  }),
};
