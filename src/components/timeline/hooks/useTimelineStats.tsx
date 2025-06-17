
import { useMemo } from 'react';
import { Task } from '@/types/database';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

interface TimelineStatsData {
  totalTasks: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  criticalPath: number;
}

export const useTimelineStats = (
  tasks: Task[],
  selectedProject: string,
  filters: TimelineFilters
): TimelineStatsData => {
  return useMemo(() => {
    let filteredTasks = selectedProject !== 'all'
      ? tasks.filter(task => task.project_id === selectedProject)
      : tasks;

    // Apply additional filters
    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    if (filters.category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }
    if (filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    const totalTasks = filteredTasks.length;
    let onTrack = 0, atRisk = 0, delayed = 0, criticalPath = 0;

    for (const task of filteredTasks) {
      if (task.status === 'completed') continue;
      // Delayed if due date is past and not completed
      if (task.due_date && new Date(task.due_date) < new Date()) {
        delayed++;
      }
      // At risk if in-progress and past 80% of estimated hours (if available), or low progress & soon due
      else if (
        (task.progress !== undefined && task.progress < 50 && task.status === 'in-progress') ||
        (task.estimated_hours && task.actual_hours && task.actual_hours > task.estimated_hours * 0.8)
      ) {
        atRisk++;
      }
      // Assume critical path: for now, all "critical" priority tasks not done
      if (task.priority === 'critical') {
        criticalPath++;
      }
      else if (task.status === 'in-progress' || task.status === 'not-started') {
        onTrack++;
      }
    }

    return {
      totalTasks,
      onTrack,
      atRisk,
      delayed,
      criticalPath,
    };
  }, [tasks, selectedProject, filters]);
};
