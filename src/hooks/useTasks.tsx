
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';
import { useImprovedTaskSubscription } from './tasks/useImprovedTaskSubscription';
import { useTaskOperations } from './tasks/useTaskOperations';
import { useTaskFetching } from './tasks/useTaskFetching';

/**
 * Main tasks hook that provides complete task management functionality
 * 
 * This hook combines:
 * - Initial task fetching
 * - Real-time updates via improved subscription system
 * - Task creation and updates
 * - Manual refetch capability
 * 
 * @example
 * ```typescript
 * const { tasks, loading, error, createTask, updateTask, refetch } = useTasks();
 * ```
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  const { loading, error, fetchTasks } = useTaskFetching(user);
  const { createTask, updateTask } = useTaskOperations(user);
  
  // Set up real-time subscription for all tasks
  useImprovedTaskSubscription({ 
    user, 
    onTasksUpdate: setTasks 
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

  return {
    tasks,
    loading,
    error, // Now consistently a string | null
    createTask,
    updateTask,
    refetch
  };
};
