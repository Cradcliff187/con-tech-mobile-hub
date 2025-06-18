
import { useState, useEffect, useContext } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { GanttContext } from '@/contexts/gantt';

interface UseTaskProcessingProps {
  projectId: string;
}

export const useTaskProcessing = ({ projectId }: UseTaskProcessingProps) => {
  // Try to use context if available
  const context = useContext(GanttContext);
  
  // Fallback to direct useTasks for backward compatibility
  const { tasks: fallbackTasks, loading: fallbackLoading, error: fallbackError } = useTasks();
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Use context data if available, otherwise use fallback
  const tasks = context?.state.tasks || fallbackTasks;
  const loading = context?.state.loading ?? fallbackLoading;
  const error = context?.state.error || fallbackError;

  // Filter tasks for the selected project (only needed when not using context)
  useEffect(() => {
    if (context) {
      // Context handles project filtering internally
      setProjectTasks(context.state.tasks);
    } else {
      // Manual filtering for backward compatibility
      const filtered = projectId && projectId !== 'all' 
        ? tasks.filter(task => task.project_id === projectId)
        : tasks;
      
      setProjectTasks(filtered);
    }
  }, [tasks, projectId, context]);

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;

  return {
    projectTasks,
    loading,
    error,
    completedTasks
  };
};
