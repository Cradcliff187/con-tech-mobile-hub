
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';
import { useTaskSubscription } from './tasks/useTaskSubscription';
import { useTaskOperations } from './tasks/useTaskOperations';
import { useTaskFetching } from './tasks/useTaskFetching';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  const { loading, error, fetchTasks } = useTaskFetching(user);
  const { createTask, updateTask } = useTaskOperations(user);
  const { subscriptionStatus } = useTaskSubscription({ 
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
    error,
    subscriptionStatus,
    createTask,
    updateTask,
    refetch
  };
};
