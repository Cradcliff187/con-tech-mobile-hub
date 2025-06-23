import { GanttState, GanttAction } from './types';

export const initialGanttState = (): GanttState => {
  const now = new Date();
  const timelineStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const timelineEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  return {
    // Task Data
    tasks: [],
    optimisticUpdates: new Map(),
    dependencies: [],
    
    // UI State
    selectedTaskId: null,
    selectedTasks: [],
    multiSelectMode: false,
    searchQuery: '',
    viewMode: 'weeks',
    
    // Filter State
    filters: {
      status: [],
      priority: [],
      category: [],
      lifecycle_status: [],
    },
    
    // Timeline State
    timelineStart,
    timelineEnd,
    currentViewStart: timelineStart,
    currentViewEnd: timelineEnd,
    showMiniMap: false,
    
    // Drag State
    dragState: {
      isDragging: false,
      draggedTask: null,
      dropPreviewDate: null,
      currentValidity: 'valid',
      violationMessages: [],
    },
    
    // Loading States
    loading: false,
    error: null,
    saving: false,
  };
};

export const ganttReducer = (state: GanttState, action: GanttAction): GanttState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTasks: state.selectedTasks.filter(task => task.id !== action.payload),
        selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId,
      };

    case 'SET_OPTIMISTIC_UPDATE':
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.id, action.payload.updates);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };

    case 'CLEAR_OPTIMISTIC_UPDATE':
      const clearedOptimisticUpdates = new Map(state.optimisticUpdates);
      clearedOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        optimisticUpdates: clearedOptimisticUpdates,
      };

    case 'CLEAR_ALL_OPTIMISTIC_UPDATES':
      return {
        ...state,
        optimisticUpdates: new Map(),
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_SELECTED_TASK':
      return {
        ...state,
        selectedTaskId: action.payload,
      };

    case 'SET_SELECTED_TASKS':
      return {
        ...state,
        selectedTasks: action.payload,
      };

    case 'SET_MULTI_SELECT_MODE':
      return {
        ...state,
        multiSelectMode: action.payload,
        selectedTasks: action.payload ? state.selectedTasks : [], // Clear selection when disabling
      };

    case 'SET_DEPENDENCIES':
      return {
        ...state,
        dependencies: action.payload,
      };

    case 'ADD_DEPENDENCY':
      return {
        ...state,
        dependencies: [...state.dependencies, action.payload],
      };

    case 'DELETE_DEPENDENCY':
      return {
        ...state,
        dependencies: state.dependencies.filter(dep => dep.id !== action.payload),
      };

    case 'SET_TIMELINE_BOUNDS':
      return {
        ...state,
        timelineStart: action.payload.start,
        timelineEnd: action.payload.end,
      };

    case 'SET_VIEWPORT':
      return {
        ...state,
        currentViewStart: action.payload.start,
        currentViewEnd: action.payload.end,
      };

    case 'SET_SHOW_MINIMAP':
      return {
        ...state,
        showMiniMap: action.payload,
      };

    case 'SET_DRAG_STATE':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          ...action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_SAVING':
      return {
        ...state,
        saving: action.payload,
      };

    default:
      return state;
  }
};
