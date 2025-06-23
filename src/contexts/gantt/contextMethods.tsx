
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { GanttState, GanttAction } from './types';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { useProjects } from '@/hooks/useProjects';

interface UseGanttContextMethodsProps {
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
  filteredTasks: Task[];
}

export const useGanttContextMethods = ({ state, dispatch, filteredTasks }: UseGanttContextMethodsProps) => {
  const { projects } = useProjects();

  // Get filtered tasks based on all filters including lifecycle_status
  const getFilteredTasks = useMemo(() => {
    return () => {
      return state.tasks.filter(task => {
        // Search query filter
        if (state.searchQuery) {
          const searchLower = state.searchQuery.toLowerCase();
          const matchesSearch = 
            task.title?.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower) ||
            task.category?.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) return false;
        }

        // Status filter
        if (state.filters.status.length > 0 && !state.filters.status.includes(task.status)) {
          return false;
        }
        
        // Priority filter
        if (state.filters.priority.length > 0 && !state.filters.priority.includes(task.priority)) {
          return false;
        }
        
        // Category filter
        if (state.filters.category.length > 0 && task.category) {
          const hasMatchingCategory = state.filters.category.some((cat: string) =>
            task.category!.toLowerCase().includes(cat.toLowerCase())
          );
          if (!hasMatchingCategory) return false;
        }
        
        // Lifecycle status filter - filter by project's lifecycle status
        if (state.filters.lifecycle_status.length > 0) {
          const project = projects.find(p => p.id === task.project_id);
          if (project) {
            const projectLifecycleStatus = getLifecycleStatus(project);
            if (!state.filters.lifecycle_status.includes(projectLifecycleStatus)) {
              return false;
            }
          }
        }
        
        return true;
      });
    };
  }, [state.tasks, state.searchQuery, state.filters, projects]);

  // Helper methods
  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters: Partial<GanttState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setViewMode = (mode: 'days' | 'weeks' | 'months') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const selectTask = (taskId: string | null) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: taskId });
  };

  const getDisplayTask = (taskId: string): Task | undefined => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return undefined;

    const optimisticUpdate = state.optimisticUpdates.get(taskId);
    return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
  };

  const updateTaskOptimistic = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'SET_OPTIMISTIC_UPDATE', payload: { id, updates } });
  };

  const clearOptimisticUpdate = (id: string) => {
    dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: id });
  };

  const clearAllOptimisticUpdates = () => {
    dispatch({ type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' });
  };

  return {
    getFilteredTasks,
    setSearchQuery,
    setFilters,
    setViewMode,
    selectTask,
    getDisplayTask,
    updateTaskOptimistic,
    clearOptimisticUpdate,
    clearAllOptimisticUpdates
  };
};
