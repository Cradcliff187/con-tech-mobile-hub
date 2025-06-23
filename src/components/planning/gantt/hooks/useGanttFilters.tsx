
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../utils/taskUtils';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { useProjects } from '@/hooks/useProjects';
import type { FilterState } from '../types/ganttTypes';

export const useGanttFilters = (tasks: Task[], filters: FilterState) => {
  const { projects } = useProjects();

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && task.category) {
        const hasMatchingCategory = filters.category.some((cat: string) =>
          task.category!.toLowerCase().includes(cat.toLowerCase())
        );
        if (!hasMatchingCategory) return false;
      }
      
      // Lifecycle status filter - filter by project's lifecycle status
      if (filters.lifecycle_status.length > 0) {
        const project = projects.find(p => p.id === task.project_id);
        if (project) {
          const projectLifecycleStatus = getLifecycleStatus(project);
          if (!filters.lifecycle_status.includes(projectLifecycleStatus)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [tasks, filters, projects]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(tasks.map(task => task.status))];
    const priorities = [...new Set(tasks.map(task => task.priority))];
    const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
    const assignees = [...new Set(tasks.map(task => getAssigneeName(task)))];
    
    // Get unique lifecycle statuses from projects
    const lifecycleStatuses = [...new Set(
      projects
        .filter(p => tasks.some(t => t.project_id === p.id))
        .map(p => getLifecycleStatus(p))
    )];
    
    return {
      statuses,
      priorities,
      categories,
      assignees,
      lifecycleStatuses
    };
  }, [tasks, projects]);

  return {
    filteredTasks,
    filterOptions
  };
};
