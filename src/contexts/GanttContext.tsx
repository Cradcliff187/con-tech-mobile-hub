import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { Task } from '@/types/database';
import { useImprovedTaskSubscription } from '@/hooks/tasks/useImprovedTaskSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { getAssigneeName } from '@/components/planning/gantt/ganttUtils';
import { startOfMonth, endOfMonth, addMonths, subDays, addDays, min, max } from 'date-fns';

// State Interface
interface GanttState {
  // Task Data
  tasks: Task[];
  optimisticUpdates: Map<string, Partial<Task>>;
  
  // UI State
  selectedTaskId: string | null;
  searchQuery: string;
  viewMode: 'days' | 'weeks' | 'months';
  
  // Filter State
  filters: {
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  };
  
  // Timeline State
  timelineStart: Date;
  timelineEnd: Date;
  currentViewStart: Date;
  currentViewEnd: Date;
  showMiniMap: boolean;
  
  // Drag State
  dragState: {
    isDragging: boolean;
    draggedTask: Task | null;
    dropPreviewDate: Date | null;
    currentValidity: 'valid' | 'warning' | 'invalid';
    violationMessages: string[];
  };
  
  // Loading States
  loading: boolean;
  error: string | null;
  saving: boolean;
}

// Action Types
type GanttAction = 
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'CLEAR_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<GanttState['filters']> }
  | { type: 'SET_VIEW_MODE'; payload: 'days' | 'weeks' | 'months' }
  | { type: 'SET_SELECTED_TASK'; payload: string | null }
  | { type: 'SET_TIMELINE_BOUNDS'; payload: { start: Date; end: Date } }
  | { type: 'SET_VIEWPORT'; payload: { start: Date; end: Date } }
  | { type: 'SET_SHOW_MINIMAP'; payload: boolean }
  | { type: 'SET_DRAG_STATE'; payload: Partial<GanttState['dragState']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean };

// Initial State
const createInitialState = (): GanttState => {
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
const ganttReducer = (state: GanttState, action: GanttAction): GanttState => {
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

// Context Value Interface
interface GanttContextValue {
  state: GanttState;
  
  // Task Operations
  getDisplayTask: (taskId: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  updateTaskOptimistic: (id: string, updates: Partial<Task>) => void;
  clearOptimisticUpdate: (id: string) => void;
  clearAllOptimisticUpdates: () => void;
  
  // UI Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<GanttState['filters']>) => void;
  setViewMode: (mode: 'days' | 'weeks' | 'months') => void;
  selectTask: (taskId: string | null) => void;
  
  // Timeline Actions
  setViewport: (start: Date, end: Date) => void;
  setShowMiniMap: (show: boolean) => void;
  navigateToDate: (date: Date) => void;
  
  // Drag Operations
  startDrag: (task: Task) => void;
  updateDragPreview: (date: Date, validity: 'valid' | 'warning' | 'invalid', messages?: string[]) => void;
  completeDrag: (updates: Partial<Task>) => Promise<void>;
  cancelDrag: () => void;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;
}

// Create Context
const GanttContext = createContext<GanttContextValue | undefined>(undefined);

// Provider Props
interface GanttProviderProps {
  children: React.ReactNode;
  projectId?: string;
}

// Provider Component
export const GanttProvider: React.FC<GanttProviderProps> = ({ children, projectId }) => {
  const [state, dispatch] = useReducer(ganttReducer, createInitialState());
  const { user } = useAuth();
  const { tasks: allTasks, updateTask, loading: tasksLoading, error: tasksError } = useTasks();

  // Filter tasks by project if projectId is provided
  const projectTasks = useMemo(() => {
    if (!projectId || projectId === 'all') return allTasks;
    return allTasks.filter(task => task.project_id === projectId);
  }, [allTasks, projectId]);

  // Set up real-time subscription for project tasks
  const handleTasksUpdate = useCallback((updateFn: (prevTasks: Task[]) => Task[]) => {
    const updatedTasks = updateFn(projectTasks);
    dispatch({ type: 'SET_TASKS', payload: updatedTasks });
  }, [projectTasks]);

  useImprovedTaskSubscription({
    user,
    onTasksUpdate: handleTasksUpdate,
    projectId
  });

  // Update tasks when project tasks change
  useEffect(() => {
    dispatch({ type: 'SET_TASKS', payload: projectTasks });
  }, [projectTasks]);

  // Update loading and error states
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: tasksLoading });
  }, [tasksLoading]);

  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: tasksError });
  }, [tasksError]);

  // Helper function to check if task matches search query
  const matchesSearch = useCallback((task: Task, query: string): boolean => {
    const searchLower = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      getAssigneeName(task).toLowerCase().includes(searchLower) ||
      (task.category && task.category.toLowerCase().includes(searchLower))
    );
  }, []);

  // Get display task with optimistic updates applied
  const getDisplayTask = useCallback((taskId: string): Task | undefined => {
    const baseTask = state.tasks.find(t => t.id === taskId);
    if (!baseTask) return undefined;

    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...baseTask, ...optimisticUpdate } : baseTask;
  }, [state.tasks, state.optimisticUpdates]);

  // Get filtered tasks with memoization
  const getFilteredTasks = useMemo(() => {
    return state.tasks
      .map(task => {
        const optimisticUpdate = state.optimisticUpdates.get(task.id);
        return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
      })
      .filter(task => {
        // Apply search filter
        if (state.searchQuery.trim() && !matchesSearch(task, state.searchQuery)) {
          return false;
        }
        
        // Apply status filter
        if (state.filters.status.length > 0 && !state.filters.status.includes(task.status)) {
          return false;
        }
        
        // Apply priority filter
        if (state.filters.priority.length > 0 && !state.filters.priority.includes(task.priority)) {
          return false;
        }
        
        // Apply category filter
        if (state.filters.category.length > 0 && task.category) {
          const hasMatchingCategory = state.filters.category.some(cat =>
            task.category!.toLowerCase().includes(cat.toLowerCase())
          );
          if (!hasMatchingCategory) return false;
        }
        
        return true;
      });
  }, [state.tasks, state.optimisticUpdates, state.searchQuery, state.filters, matchesSearch]);

  // Calculate timeline bounds based on filtered tasks
  const calculateTimelineBounds = useMemo(() => {
    const tasksWithDates = getFilteredTasks.filter(task => 
      task.start_date || task.due_date
    );
    
    if (tasksWithDates.length === 0) {
      const now = new Date();
      return {
        start: startOfMonth(now),
        end: endOfMonth(addMonths(now, 2))
      };
    }
    
    const allDates = tasksWithDates.flatMap(task => [
      task.start_date ? new Date(task.start_date) : null,
      task.due_date ? new Date(task.due_date) : null
    ]).filter((date): date is Date => date !== null);
    
    return {
      start: subDays(min(allDates), 7),
      end: addDays(max(allDates), 7)
    };
  }, [getFilteredTasks]);

  // Update timeline bounds when tasks change
  useEffect(() => {
    dispatch({ 
      type: 'SET_TIMELINE_BOUNDS', 
      payload: calculateTimelineBounds 
    });
    
    // Update viewport to match timeline bounds if not manually set
    dispatch({
      type: 'SET_VIEWPORT',
      payload: calculateTimelineBounds
    });
  }, [calculateTimelineBounds]);

  // Context value with all methods
  const contextValue: GanttContextValue = {
    state,
    
    // Task Operations
    getDisplayTask,
    getFilteredTasks: useCallback(() => getFilteredTasks, [getFilteredTasks]),
    updateTaskOptimistic: useCallback((id: string, updates: Partial<Task>) => {
      dispatch({ type: 'SET_OPTIMISTIC_UPDATE', payload: { id, updates } });
    }, []),
    clearOptimisticUpdate: useCallback((id: string) => {
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: id });
    }, []),
    clearAllOptimisticUpdates: useCallback(() => {
      dispatch({ type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' });
    }, []),
    
    // UI Actions
    setSearchQuery: useCallback((query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    }, []),
    setFilters: useCallback((filters: Partial<GanttState['filters']>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    }, []),
    setViewMode: useCallback((mode: 'days' | 'weeks' | 'months') => {
      dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    }, []),
    selectTask: useCallback((taskId: string | null) => {
      dispatch({ type: 'SET_SELECTED_TASK', payload: taskId });
    }, []),
    
    // Timeline Actions
    setViewport: useCallback((start: Date, end: Date) => {
      dispatch({ type: 'SET_VIEWPORT', payload: { start, end } });
    }, []),
    setShowMiniMap: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_MINIMAP', payload: show });
    }, []),
    navigateToDate: useCallback((date: Date) => {
      // Calculate new viewport centered on the target date
      const viewportDuration = state.currentViewEnd.getTime() - state.currentViewStart.getTime();
      const halfDuration = viewportDuration / 2;
      
      const newStart = new Date(date.getTime() - halfDuration);
      const newEnd = new Date(date.getTime() + halfDuration);
      
      dispatch({ type: 'SET_VIEWPORT', payload: { start: newStart, end: newEnd } });
    }, [state.currentViewStart, state.currentViewEnd]),
    
    // Drag Operations
    startDrag: useCallback((task: Task) => {
      dispatch({
        type: 'SET_DRAG_STATE',
        payload: {
          isDragging: true,
          draggedTask: task,
          dropPreviewDate: null,
          currentValidity: 'valid',
          violationMessages: []
        }
      });
    }, []),
    updateDragPreview: useCallback((date: Date, validity: 'valid' | 'warning' | 'invalid', messages: string[] = []) => {
      dispatch({
        type: 'SET_DRAG_STATE',
        payload: {
          dropPreviewDate: date,
          currentValidity: validity,
          violationMessages: messages
        }
      });
    }, []),
    completeDrag: useCallback(async (updates: Partial<Task>) => {
      if (!state.dragState.draggedTask) return;
      
      const taskId = state.dragState.draggedTask.id;
      
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        
        // Apply optimistic update
        dispatch({
          type: 'SET_OPTIMISTIC_UPDATE',
          payload: { id: taskId, updates }
        });
        
        // Perform actual update
        const { error } = await updateTask(taskId, updates);
        
        if (error) {
          throw new Error(error);
        }
        
        // Clear optimistic update on success
        dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: taskId });
        
      } catch (error) {
        console.error('Failed to update task:', error);
        dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: taskId });
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Update failed' });
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
        dispatch({
          type: 'SET_DRAG_STATE',
          payload: {
            isDragging: false,
            draggedTask: null,
            dropPreviewDate: null,
            currentValidity: 'valid',
            violationMessages: []
          }
        });
      }
    }, [state.dragState.draggedTask, updateTask]),
    cancelDrag: useCallback(() => {
      dispatch({
        type: 'SET_DRAG_STATE',
        payload: {
          isDragging: false,
          draggedTask: null,
          dropPreviewDate: null,
          currentValidity: 'valid',
          violationMessages: []
        }
      });
    }, []),
    
    // State Management
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),
    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),
    setSaving: useCallback((saving: boolean) => {
      dispatch({ type: 'SET_SAVING', payload: saving });
    }, [])
  };

  return (
    <GanttContext.Provider value={contextValue}>
      {children}
    </GanttContext.Provider>
  );
};

// Custom hook to use the context
export const useGanttContext = (): GanttContextValue => {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider');
  }
  return context;
};

// Export types for external use
export type { GanttState, GanttAction, GanttContextValue };
