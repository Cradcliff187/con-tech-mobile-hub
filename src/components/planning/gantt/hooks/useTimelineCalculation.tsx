
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getDaysBetween, calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import type { ProjectData } from '../types/ganttTypes';

interface UseTimelineCalculationProps {
  projectTasks: Task[];
  viewMode: 'days' | 'weeks' | 'months';
  selectedProject: ProjectData | null;
}

export const useTimelineCalculation = ({
  projectTasks,
  viewMode,
  selectedProject
}: UseTimelineCalculationProps) => {
  
  const totalDays = useMemo(() => {
    if (projectTasks.length === 0) return 30; // Default fallback
    
    const dates = projectTasks.flatMap(task => {
      const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      return [calculatedStartDate, calculatedEndDate];
    });
    
    if (dates.length === 0) return 30;
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return getDaysBetween(minDate, maxDate);
  }, [projectTasks]);

  const projectProgress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    
    const totalProgress = projectTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / projectTasks.length);
  }, [projectTasks]);

  const completedTasks = useMemo(() => {
    return projectTasks.filter(task => task.status === 'completed').length;
  }, [projectTasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    return projectTasks.filter(task => {
      const { calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      return calculatedEndDate < today && task.status !== 'completed';
    }).length;
  }, [projectTasks]);

  return {
    totalDays,
    projectProgress,
    completedTasks,
    overdueTasks
  };
};
