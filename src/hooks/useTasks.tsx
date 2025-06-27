
import { useState, useEffect } from 'react';
import { useAuthSession } from '@/contexts/AuthSessionContext';
import { Task } from '@/types/database';
import { useImprovedTaskSubscription } from './tasks/useImprovedTaskSubscription';
import { useTaskOperations } from './tasks/useTaskOperations';
import { useTaskFetching } from './tasks/useTaskFetching';

interface UseTasksOptions {
  projectId?: string;
}

/**
 * Enhanced tasks hook with intelligent project filtering
 * This is the single source of truth for all task subscriptions
 */
export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { sessionHealth, validateSessionForOperation } = useAuthSession();
  const { projectId } = options;

  // Only proceed with task operations if session is healthy
  const isSessionReady = sessionHealth.frontendAuthenticated;

  const { loading, error, fetchTasks } = useTaskFetching(isSessionReady);
  const { createTask, updateTask } = useTaskOperations(isSessionReady);
  
  // Single subscription for all tasks with intelligent filtering
  useImprovedTaskSubscription({ 
    sessionReady: isSessionReady,
    onTasksUpdate: setTasks,
    projectId // Pass project filter to subscription
  });

  useEffect(() => {
    if (!isSessionReady) return;

    // Initial fetch only when session is ready
    fetchTasks().then((fetchedTasks) => {
      if (fetchedTasks) {
        setTasks(fetchedTasks);
      }
    });
  }, [isSessionReady, fetchTasks]);

  const refetch = async () => {
    if (!isSessionReady) return;
    
    const isValid = await validateSessionForOperation('Fetch Tasks');
    if (!isValid) return;

    const fetchedTasks = await fetchTasks();
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  };

  // Filter tasks by project if specified
  const filteredTasks = projectId && projectId !== 'all' 
    ? tasks.filter(task => task.project_id === projectId)
    : tasks;

  return {
    tasks: filteredTasks,
    loading: loading || !isSessionReady,
    error,
    createTask,
    updateTask,
    refetch
  };
};
