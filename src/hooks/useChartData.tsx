
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { getStatusMetadata } from '@/types/projectStatus';
import { Project } from '@/types/database';

export interface ProjectProgressData {
  name: string;
  progress: number;
  budget: number;
  spent: number;
  lifecycle_status: string;
  status_label: string;
}

export interface TaskStatusData {
  status: string;
  count: number;
}

export interface LifecycleStatusData {
  status: string;
  label: string;
  count: number;
  color: string;
}

export const useChartData = () => {
  const [projectProgress, setProjectProgress] = useState<ProjectProgressData[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatusData[]>([]);
  const [lifecycleStatusData, setLifecycleStatusData] = useState<LifecycleStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch project progress data with lifecycle status
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id, name, progress, budget, spent, lifecycle_status, status, phase, created_at, updated_at')
        .order('name');

      if (projectError) {
        console.error('Error fetching project data:', projectError);
      } else {
        const progressData: ProjectProgressData[] = (projects || []).map(project => {
          // Create a properly typed Project object for getLifecycleStatus
          const projectData: Project = {
            ...project,
            phase: project.phase as Project['phase'] || 'planning',
            progress: project.progress || 0,
            spent: project.spent || 0
          };
          
          const lifecycleStatus = getLifecycleStatus(projectData);
          const statusMetadata = getStatusMetadata(lifecycleStatus);
          
          return {
            name: project.name,
            progress: project.progress || 0,
            budget: Number(project.budget) || 0,
            spent: Number(project.spent) || 0,
            lifecycle_status: lifecycleStatus,
            status_label: statusMetadata.label
          };
        });
        setProjectProgress(progressData);

        // Calculate lifecycle status distribution
        const statusCounts = progressData.reduce((acc, project) => {
          const status = project.lifecycle_status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const lifecycleData: LifecycleStatusData[] = Object.entries(statusCounts).map(([status, count]) => {
          const metadata = getStatusMetadata(status as any);
          return {
            status,
            label: metadata.label,
            count,
            color: metadata.color
          };
        });
        setLifecycleStatusData(lifecycleData);
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
    lifecycleStatusData,
    loading,
    refetch: fetchChartData
  };
};
