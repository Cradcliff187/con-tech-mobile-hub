
import { useCallback, useMemo } from 'react';
import { Task } from '@/types/database';
import { GanttState, GanttAction } from './types';
import { useTasks } from '@/hooks/useTasks';

interface UseGanttContextMethodsProps {
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
  filteredTasks: Task[];
  projectId?: string;
}

export const useGanttContextMethods = ({ state, dispatch, filteredTasks, projectId }: UseGanttContextMethodsProps) => {
  // Get task operations for database updates
  const { updateTask: updateTaskMutation } = useTasks({ projectId });

  // Create stable task signature for dependency tracking
  const taskSignature = useMemo(() => {
    return `${filteredTasks.length}-${filteredTasks.map(t => `${t.id}-${t.status}-${t.priority}`).join('|')}`;
  }, [filteredTasks]);

  // Create stable state signature for dependency tracking
  const stateSignature = useMemo(() => {
    return `${state.tasks.length}-${state.optimisticUpdates.size}-${state.currentViewStart.getTime()}-${state.currentViewEnd.getTime()}`;
  }, [state.tasks.length, state.optimisticUpdates.size, state.currentViewStart, state.currentViewEnd]);

  // Core filtering method using the utility function - with stable dependencies
  const getFilteredTasks = useCallback((): Task[] => {
    console.log('🎯 getFilteredTasks called with signature:', taskSignature);
    return filteredTasks;
  }, [taskSignature]);

  // Helper method to get a task with optimistic updates applied
  const getDisplayTask = useCallback((taskId: string): Task | undefined => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
  }, [stateSignature]);

  // Optimistic update methods with useCallback to prevent re-renders
  const updateTaskOptimistic = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'SET_OPTIMISTIC_UPDATE', payload: { id, updates } });
  }, [dispatch]);

  const clearOptimisticUpdate = useCallback((id: string) => {
    dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: id });
  }, [dispatch]);

  const clearAllOptimisticUpdates = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' });
  }, [dispatch]);

  // UI action methods with useCallback
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  const setFilters = useCallback((filters: Partial<GanttState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, [dispatch]);

  const setViewMode = useCallback((mode: 'days' | 'weeks' | 'months') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [dispatch]);

  const selectTask = useCallback((taskId: string | null) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: taskId });
  }, [dispatch]);

  // Timeline action methods with useCallback and stable dependencies
  const setViewport = useCallback((start: Date, end: Date) => {
    dispatch({ type: 'SET_VIEWPORT', payload: { start, end } });
  }, [dispatch]);

  const setShowMiniMap = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_MINIMAP', payload: show });
  }, [dispatch]);

  const navigateToDate = useCallback((date: Date) => {
    // Calculate new viewport centered on the target date using current state
    const viewportMs = state.currentViewEnd.getTime() - state.currentViewStart.getTime();
    const halfViewportMs = Math.floor(viewportMs / 2);
    
    const newStart = new Date(date.getTime() - halfViewportMs);
    const newEnd = new Date(date.getTime() + halfViewportMs);
    
    setViewport(newStart, newEnd);
  }, [state.currentViewStart, state.currentViewEnd, setViewport]);

  // Drag operation methods with useCallback
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
  }, [dispatch]);

  const updateDragPreview = useCallback((date: Date, validity: 'valid' | 'warning' | 'invalid', messages: string[] = []) => {
    dispatch({ 
      type: 'SET_DRAG_STATE', 
      payload: { 
        dropPreviewDate: date,
        currentValidity: validity,
        violationMessages: messages
      } 
    });
  }, [dispatch]);

  const completeDrag = useCallback(async (updates: Partial<Task>) => {
    if (!state.dragState.draggedTask) {
      console.warn('No dragged task found when completing drag');
      throw new Error('No task being dragged');
    }

    const taskId = state.dragState.draggedTask.id;
    
    try {
      // Apply optimistic update first
      updateTaskOptimistic(taskId, updates);
      
      // Attempt database update
      console.log('🎯 Saving drag changes to database:', { taskId, updates });
      const result = await updateTaskMutation(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Clear optimistic update on success (real data will come from subscription)
      clearOptimisticUpdate(taskId);
      
      console.log('✅ Drag changes saved successfully');
      
      // Reset drag state on success
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
      // Rollback optimistic update on failure
      console.error('❌ Failed to save drag changes:', error);
      clearOptimisticUpdate(taskId);
      
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
      
      // Re-throw to allow UI error handling
      throw error;
    }
  }, [state.dragState.draggedTask, updateTaskOptimistic, updateTaskMutation, clearOptimisticUpdate, dispatch]);

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
  }, [dispatch]);

  // State management methods with useCallback
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, [dispatch]);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, [dispatch]);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  }, [dispatch]);

  return {
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
};
