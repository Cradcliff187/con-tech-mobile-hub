
import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { GanttContextValue, GanttState } from './types';
import { ganttReducer, initialGanttState } from './reducer';
import { createGanttActions } from './actions';
import { applyTaskFilters } from './utils';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/database';

export const GanttContext = createContext<GanttContextValue | undefined>(undefined);

interface GanttProviderProps {
  children: ReactNode;
  initialState?: Partial<GanttState>;
  projectId?: string;
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ 
  children, 
  initialState,
  projectId
}) => {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    { ...initialGanttState(), ...initialState }
  );

  // Fetch tasks using the useTasks hook
  const { tasks: fetchedTasks, loading, error } = useTasks({ 
    projectId: projectId && projectId !== 'all' ? projectId : undefined 
  });

  // Update tasks in state when fetched tasks change
  useEffect(() => {
    if (fetchedTasks && fetchedTasks.length > 0) {
      dispatch(createGanttActions.setTasks(fetchedTasks));
    }
    dispatch({ type: 'SET_LOADING', payload: loading });
    dispatch({ type: 'SET_ERROR', payload: error || null });
  }, [fetchedTasks, loading, error]);

  // Helper method to get a task with optimistic updates applied
  const getDisplayTask = useCallback((taskId: string): Task | undefined => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
  }, [state.tasks, state.optimisticUpdates]);

  // Core filtering method using the utility function
  const getFilteredTasks = useCallback((): Task[] => {
    return applyTaskFilters(
      state.tasks,
      state.optimisticUpdates,
      state.searchQuery,
      state.filters
    );
  }, [state.tasks, state.optimisticUpdates, state.searchQuery, state.filters]);

  // Optimistic update methods
  const updateTaskOptimistic = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'SET_OPTIMISTIC_UPDATE', payload: { id, updates } });
  }, []);

  const clearOptimisticUpdate = useCallback((id: string) => {
    dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: id });
  }, []);

  const clearAllOptimisticUpdates = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' });
  }, []);

  // UI action methods
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setFilters = useCallback((filters: Partial<GanttState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setViewMode = useCallback((mode: 'days' | 'weeks' | 'months') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const selectTask = useCallback((taskId: string | null) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: taskId });
  }, []);

  // Timeline action methods
  const setViewport = useCallback((start: Date, end: Date) => {
    dispatch({ type: 'SET_VIEWPORT', payload: { start, end } });
  }, []);

  const setShowMiniMap = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_MINIMAP', payload: show });
  }, []);

  const navigateToDate = useCallback((date: Date) => {
    // Calculate new viewport centered on the target date
    const viewportDays = Math.ceil((state.currentViewEnd.getTime() - state.currentViewStart.getTime()) / (1000 * 60 * 60 * 24));
    const halfViewport = Math.floor(viewportDays / 2);
    
    const newStart = new Date(date);
    newStart.setDate(newStart.getDate() - halfViewport);
    
    const newEnd = new Date(date);
    newEnd.setDate(newEnd.getDate() + halfViewport);
    
    setViewport(newStart, newEnd);
  }, [state.currentViewStart, state.currentViewEnd]);

  // Drag operation methods
  const startDrag = useCallback((task: Task) => {
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
  }, []);

  const updateDragPreview = useCallback((date: Date, validity: 'valid' | 'warning' | 'invalid', messages: string[] = []) => {
    dispatch({ 
      type: 'SET_DRAG_STATE', 
      payload: { 
        dropPreviewDate: date,
        currentValidity: validity,
        violationMessages: messages
      } 
    });
  }, []);

  const completeDrag = useCallback(async (updates: Partial<Task>) => {
    if (state.dragState.draggedTask) {
      // Apply optimistic update first
      updateTaskOptimistic(state.dragState.draggedTask.id, updates);
      
      // Reset drag state
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
  }, [state.dragState.draggedTask, updateTaskOptimistic]);

  const cancelDrag = useCallback(() => {
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
  }, []);

  // State management methods
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  }, []);

  const value: GanttContextValue = {
    state,
    dispatch,
    
    // Helper methods
    getDisplayTask,
    getFilteredTasks,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    clearAllOptimisticUpdates,
    
    // UI Actions
    setSearchQuery,
    setFilters,
    setViewMode,
    selectTask,
    
    // Timeline Actions
    setViewport,
    setShowMiniMap,
    navigateToDate,
    
    // Drag Operations
    startDrag,
    updateDragPreview,
    completeDrag,
    cancelDrag,
    
    // State Management
    setLoading,
    setError,
    setSaving,
  };

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
};
