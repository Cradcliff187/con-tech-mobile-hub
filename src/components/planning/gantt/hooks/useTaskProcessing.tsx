
import { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';

interface UseTaskProcessingProps {
  projectId: string;
}

interface TaskProcessingStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionPercentage: number;
}

export const useTaskProcessing = ({ projectId }: UseTaskProcessingProps) => {
  // Use direct useTasks hook instead of context dependency
  const { tasks: allTasks, loading, error } = useTasks();
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? allTasks.filter(task => task.project_id === projectId)
      : allTasks;
    
    setProjectTasks(filtered);
  }, [allTasks, projectId]);

  // Calculate processing stats with stable dependencies
  const processingStats: TaskProcessingStats = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress').length;
    const blockedTasks = projectTasks.filter(t => t.status === 'blocked').length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionPercentage
    };
  }, [projectTasks.length, projectTasks.map(t => t.status).join(',')]);

  return {
    projectTasks,
    processedTasks: projectTasks, // Alias for compatibility
    loading,
    error,
    completedTasks: processingStats.completedTasks,
    processingStats
  };
};
