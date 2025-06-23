
import { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types/database';

interface UseTaskProcessingProps {
  projectId: string;
  tasks?: Task[];
}

interface TaskProcessingStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionPercentage: number;
}

export const useTaskProcessing = ({ projectId, tasks = [] }: UseTaskProcessingProps) => {
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    setProjectTasks(filtered);
  }, [tasks.length, projectId]);

  // Calculate processing stats with stable dependencies
  const processingStats: TaskProcessingStats = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress').length;
    const blockedTasks = projectTasks.filter(t => t.status === 'blocked').length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    console.log('📊 useTaskProcessing stats:', {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionPercentage
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionPercentage
    };
  }, [projectTasks.length, projectTasks.map(t => t.status).join('-')]);

  return {
    projectTasks,
    processedTasks: projectTasks,
    loading: false,
    error: null,
    completedTasks: processingStats.completedTasks,
    processingStats
  };
};
