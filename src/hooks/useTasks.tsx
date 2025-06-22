
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
 * Enhanced tasks hook with intelligent project filtering
 * This is the single source of truth for all task subscriptions
 */
export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const { projectId } = options;

  const { loading, error, fetchTasks } = useTaskFetching(user);
  const { createTask, updateTask } = useTaskOperations(user);
  
  // Single subscription for all tasks with intelligent filtering
  useImprovedTaskSubscription({ 
    user, 
    onTasksUpdate: setTasks,
    projectId // Pass project filter to subscription
  });

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchTasks().then((fetchedTasks) => {
      if (fetchedTasks) {
        setTasks(fetchedTasks);
      }
    });
  }, [user?.id]);

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
    refetch
  };
};
