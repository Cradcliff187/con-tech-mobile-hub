
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProjectProgressData {
  name: string;
  progress: number;
  budget: number;
  spent: number;
}

export interface TaskStatusData {
  status: string;
  count: number;
}

export const useChartData = () => {
  const [projectProgress, setProjectProgress] = useState<ProjectProgressData[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch project progress data
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('name, progress, budget, spent')
        .order('name');

      if (projectError) {
        console.error('Error fetching project data:', projectError);
      } else {
        const progressData: ProjectProgressData[] = (projects || []).map(project => ({
          name: project.name,
          progress: project.progress || 0,
          budget: Number(project.budget) || 0,
          spent: Number(project.spent) || 0
        }));
        setProjectProgress(progressData);
      }

      // Fetch task status data
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('status');

      if (taskError) {
        console.error('Error fetching task data:', taskError);
      } else {
        const statusCounts = (tasks || []).reduce((acc, task) => {
          const status = task.status || 'not-started';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusData: TaskStatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace('-', ' '),
          count
        }));
        setTaskStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [user]);

  return {
    projectProgress,
    taskStatus,
    loading,
    refetch: fetchChartData
  };
};
