
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/database';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

export const useTimelineData = (projectId: string, filters?: TimelineFilters) => {
  const { tasks, loading } = useTasks();
  const [timelineTasks, setTimelineTasks] = useState<Task[]>([]);

  useEffect(() => {
    let filteredTasks = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;

    // Apply additional filters if provided
    if (filters) {
      if (filters.status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      if (filters.category !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === filters.category);
      }
      if (filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
    }

    setTimelineTasks(filteredTasks);
  }, [tasks, projectId, filters]);

  const sortedTasks = [...timelineTasks].sort((a, b) => {
    const dateA = new Date(a.due_date || a.created_at);
    const dateB = new Date(b.due_date || b.created_at);
    return dateA.getTime() - dateB.getTime();
  });

  return {
    tasks: sortedTasks,
    loading
  };
};
