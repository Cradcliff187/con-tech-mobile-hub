
import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';

interface UseTaskProcessingProps {
  projectId: string;
}

export const useTaskProcessing = ({ projectId }: UseTaskProcessingProps) => {
  const { tasks, loading, error } = useTasks();
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    setProjectTasks(filtered);
  }, [tasks, projectId]);

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;

  return {
    projectTasks,
    loading,
    error,
    completedTasks
  };
};
