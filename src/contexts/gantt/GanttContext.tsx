import React, { createContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { Task } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { GanttState, GanttContextValue } from './types';
import { ganttReducer, createInitialState } from './reducer';
import { calculateTimelineBounds, applyTaskFilters } from './utils';

// Create Context
export const GanttContext = createContext<GanttContextValue | undefined>(undefined);

// Provider Props
interface GanttProviderProps {
  children: React.ReactNode;
  projectId?: string;
}

// Provider Component
export const GanttProvider: React.FC<GanttProviderProps> = ({ children, projectId }) => {
  const [state, dispatch] = useReducer(ganttReducer, createInitialState());
  const { user } = useAuth();
  
  // Use single source of truth for tasks with project filtering
  const { tasks: projectTasks, updateTask, loading: tasksLoading, error: tasksError } = useTasks({ 
    projectId 
  });

  // Update tasks when project tasks change (no additional subscription needed)
  useEffect(() => {
    dispatch({ type: 'SET_TASKS', payload: projectTasks });
  }, [projectTasks]);

  // Update loading and error states
  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: tasksError });
  }, [tasksError]);

  // Get display task with optimistic updates applied
  const getDisplayTask = useCallback((taskId: string): Task | undefined => {
    const baseTask = state.tasks.find(t => t.id === taskId);
    if (!baseTask) return undefined;

    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...baseTask, ...optimisticUpdate } : baseTask;
  }, [state.tasks, state.optimisticUpdates]);

  // Get filtered tasks with memoization
  const getFilteredTasks = useMemo(() => {
    return applyTaskFilters(
      state.tasks,
      state.optimisticUpdates,
      state.searchQuery,
      state.filters
    );
  }, [state.tasks, state.optimisticUpdates, state.searchQuery, state.filters]);

  // Calculate timeline bounds based on filtered tasks
  const timelineBounds = useMemo(() => {
    return calculateTimelineBounds(getFilteredTasks);
  }, [getFilteredTasks]);

  // Update timeline bounds when tasks change
  useEffect(() => {
    dispatch({ 
      type: 'SET_TIMELINE_BOUNDS', 
      payload: timelineBounds 
    });
    
    // Update viewport to match timeline bounds if not manually set
    dispatch({
      type: 'SET_VIEWPORT',
      payload: timelineBounds
    });
  }, [timelineBounds]);

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
