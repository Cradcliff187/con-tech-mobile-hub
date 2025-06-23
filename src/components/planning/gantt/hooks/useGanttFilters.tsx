
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../utils/taskUtils';
import { getUnifiedLifecycleStatus } from '@/utils/unified-lifecycle-utils';
import { useProjects } from '@/hooks/useProjects';
import type { FilterState } from '../types/ganttTypes';

export const useGanttFilters = (tasks: Task[], filters: FilterState) => {
  const { projects } = useProjects();

  // Create stable references for filter arrays
  const statusFilters = useMemo(() => filters.status, [filters.status.join(',')]);
  const priorityFilters = useMemo(() => filters.priority, [filters.priority.join(',')]);
  const categoryFilters = useMemo(() => filters.category, [filters.category.join(',')]);
  const lifecycleFilters = useMemo(() => filters.lifecycle_status, [filters.lifecycle_status.join(',')]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilters.length > 0 && !statusFilters.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (priorityFilters.length > 0 && !priorityFilters.includes(task.priority)) {
        return false;
      }
      
      // Category filter
      if (categoryFilters.length > 0 && task.category) {
        const hasMatchingCategory = categoryFilters.some((cat: string) =>
          task.category!.toLowerCase().includes(cat.toLowerCase())
        );
        if (!hasMatchingCategory) return false;
      }
      
      // Unified lifecycle status filter - filter by project's unified lifecycle status
      if (lifecycleFilters.length > 0) {
        const project = projects.find(p => p.id === task.project_id);
        if (project) {
          const projectUnifiedStatus = getUnifiedLifecycleStatus(project);
          if (!lifecycleFilters.includes(projectUnifiedStatus)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [tasks, statusFilters, priorityFilters, categoryFilters, lifecycleFilters, projects]);

  // Extract unique values for filter options with stable references
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(tasks.map(task => task.status))];
    const priorities = [...new Set(tasks.map(task => task.priority))];
    const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
    const assignees = [...new Set(tasks.map(task => getAssigneeName(task)))];
    
    // Get unique unified lifecycle statuses from projects
    const lifecycleStatuses = [...new Set(
      projects
        .filter(p => tasks.some(t => t.project_id === p.id))
        .map(p => getUnifiedLifecycleStatus(p))
    )];
    
    return {
      statuses,
      priorities,
      categories,
      assignees,
      lifecycleStatuses
    };
  }, [tasks.length, projects.length]);

  return {
    filteredTasks,
    filterOptions
  };
};
