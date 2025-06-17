
import { GanttState, GanttAction } from './types';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

// Initial State
export const createInitialState = (): GanttState => {
  const now = new Date();
  const defaultStart = startOfMonth(now);
  const defaultEnd = endOfMonth(addMonths(now, 2));

  return {
    tasks: [],
    optimisticUpdates: new Map(),
    selectedTaskId: null,
    searchQuery: '',
    viewMode: 'weeks',
    filters: {
      status: [],
      priority: [],
      category: [],
      phase: []
    },
    timelineStart: defaultStart,
    timelineEnd: defaultEnd,
    currentViewStart: defaultStart,
    currentViewEnd: defaultEnd,
    showMiniMap: false,
    dragState: {
      isDragging: false,
      draggedTask: null,
      dropPreviewDate: null,
      currentValidity: 'valid',
      violationMessages: []
    },
    loading: false,
    error: null,
    saving: false
  };
};

// Reducer
export const ganttReducer = (state: GanttState, action: GanttAction): GanttState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };
      
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    case 'SET_OPTIMISTIC_UPDATE':
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.id, action.payload.updates);
      return { ...state, optimisticUpdates: newOptimisticUpdates };
      
    case 'CLEAR_OPTIMISTIC_UPDATE':
      const clearedOptimisticUpdates = new Map(state.optimisticUpdates);
      clearedOptimisticUpdates.delete(action.payload);
      return { ...state, optimisticUpdates: clearedOptimisticUpdates };
      
    case 'CLEAR_ALL_OPTIMISTIC_UPDATES':
      return { ...state, optimisticUpdates: new Map() };
      
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
      
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
      
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTaskId: action.payload };
      
    case 'SET_TIMELINE_BOUNDS':
      return {
        ...state,
        timelineStart: action.payload.start,
        timelineEnd: action.payload.end
      };
      
    case 'SET_VIEWPORT':
      return {
        ...state,
        currentViewStart: action.payload.start,
        currentViewEnd: action.payload.end
      };
      
    case 'SET_SHOW_MINIMAP':
      return { ...state, showMiniMap: action.payload };
      
    case 'SET_DRAG_STATE':
      return {
        ...state,
        dragState: { ...state.dragState, ...action.payload }
      };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
      
    default:
      return state;
  }
};
