
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { GanttState, GanttAction } from './types';
import { useGanttFilters } from '@/components/planning/gantt/hooks/useGanttFilters';

interface UseGanttDataManagerProps {
  projectId?: string;
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
}

export const useGanttDataManager = ({ projectId, state, dispatch }: UseGanttDataManagerProps) => {
  // Fetch tasks from database
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId || projectId === 'all') return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tasks:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
        } else {
          dispatch({ type: 'SET_TASKS', payload: tasks || [] });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch tasks' });
      }
    };

    fetchTasks();
  }, [projectId, dispatch]);

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
  }, [state.tasks, dispatch]);

  // Apply filters to get filtered tasks
  const { filteredTasks } = useGanttFilters(state.tasks, state.filters);

  return {
    filteredTasks
  };
};
