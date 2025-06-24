
import React, { useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { GanttContext } from './GanttContext';
import { GanttContextValue, GanttState } from './types';
import { ganttReducer, initialGanttState } from './reducer';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/database';

interface GanttProviderProps {
  children: ReactNode;
  initialState?: Partial<GanttState>;
  projectId?: string;
  initialViewMode?: 'days' | 'weeks' | 'months';
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ 
  children, 
  initialState,
  projectId,
  initialViewMode
}) => {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    { 
      ...initialGanttState(), 
      ...initialState,
      ...(initialViewMode && { viewMode: initialViewMode })
    }
  );

  const { tasks, updateTask: updateTaskInDB } = useTasks({ projectId });

  // Update tasks when they change
  useEffect(() => {
    if (tasks.length > 0) {
      dispatch({ type: 'SET_TASKS', payload: tasks });
    }
  }, [tasks]);

  // Calculate timeline bounds based on tasks
  useEffect(() => {
    if (state.tasks.length === 0) return;

    const taskDates = state.tasks
      .flatMap(task => [task.start_date, task.due_date])
      .filter(Boolean)
      .map(date => new Date(date!));

    if (taskDates.length === 0) return;

    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    dispatch({
      type: 'SET_TIMELINE_BOUNDS',
      payload: { start: minDate, end: maxDate }
    });
  }, [state.tasks]);

  // Core methods
  const getDisplayTask = useCallback((taskId: string): Task | undefined => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
  }, [state.tasks, state.optimisticUpdates]);

  const getFilteredTasks = useCallback((): Task[] => {
    let filtered = state.tasks;

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(task => state.filters.status.includes(task.status));
    }

    // Apply priority filter
    if (state.filters.priority.length > 0) {
      filtered = filtered.filter(task => state.filters.priority.includes(task.priority));
    }

    // Apply category filter
    if (state.filters.category.length > 0) {
      filtered = filtered.filter(task => task.category && state.filters.category.includes(task.category));
    }

    return filtered;
  }, [state.tasks, state.searchQuery, state.filters]);

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

  // Timeline methods
  const setViewport = useCallback((start: Date, end: Date) => {
    dispatch({ type: 'SET_VIEWPORT', payload: { start, end } });
  }, []);

  const setShowMiniMap = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_MINIMAP', payload: show });
  }, []);

  const navigateToDate = useCallback((date: Date) => {
    const viewportMs = state.currentViewEnd.getTime() - state.currentViewStart.getTime();
    const halfViewportMs = Math.floor(viewportMs / 2);
    
    const newStart = new Date(date.getTime() - halfViewportMs);
    const newEnd = new Date(date.getTime() + halfViewportMs);
    
    setViewport(newStart, newEnd);
  }, [state.currentViewStart, state.currentViewEnd, setViewport]);

  // Drag methods
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
    if (!state.dragState.draggedTask) {
      throw new Error('No task being dragged');
    }

    const taskId = state.dragState.draggedTask.id;
    
    try {
      updateTaskOptimistic(taskId, updates);
      
      const result = await updateTaskInDB(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      clearOptimisticUpdate(taskId);
      
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
      
    } catch (error) {
      clearOptimisticUpdate(taskId);
      
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
      
      throw error;
    }
  }, [state.dragState.draggedTask, updateTaskOptimistic, updateTaskInDB, clearOptimisticUpdate]);

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

  const value: GanttContextValue = useMemo(() => ({
    state,
    dispatch,
    getDisplayTask,
    getFilteredTasks,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    clearAllOptimisticUpdates,
    setSearchQuery,
    setFilters,
    setViewMode,
    selectTask,
    setViewport,
    setShowMiniMap,
    navigateToDate,
    startDrag,
    updateDragPreview,
    completeDrag,
    cancelDrag,
    setLoading,
    setError,
    setSaving,
  }), [
    state,
    getDisplayTask,
    getFilteredTasks,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    clearAllOptimisticUpdates,
    setSearchQuery,
    setFilters,
    setViewMode,
    selectTask,
    setViewport,
    setShowMiniMap,
    navigateToDate,
    startDrag,
    updateDragPreview,
    completeDrag,
    cancelDrag,
    setLoading,
    setError,
    setSaving,
  ]);

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
};
