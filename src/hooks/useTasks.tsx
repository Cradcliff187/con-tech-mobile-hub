
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';
import { useImprovedTaskSubscription } from './tasks/useImprovedTaskSubscription';
import { useTaskOperations } from './tasks/useTaskOperations';
import { useTaskFetching } from './tasks/useTaskFetching';

interface UseTasksOptions {
  projectId?: string;
}

/**
 * Enhanced tasks hook with optimized subscription management
 */
export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const { projectId } = options;

  const { loading, error, fetchTasks } = useTaskFetching(user);
  const { createTask, updateTask } = useTaskOperations(user);
  
  // Optimized subscription with improved memoization
  const { subscriptionStatus } = useImprovedTaskSubscription({ 
    user, 
    onTasksUpdate: setTasks,
    projectId
  });

  useEffect(() => {
    if (!user) return;

    // Initial fetch with debouncing
    const timeoutId = setTimeout(() => {
      fetchTasks().then((fetchedTasks) => {
        if (fetchedTasks) {
          setTasks(fetchedTasks);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id, fetchTasks]);

  const refetch = async () => {
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
    loading,
    error,
    createTask,
    updateTask,
    refetch,
    subscriptionStatus // Expose subscription status for debugging
  };
};
