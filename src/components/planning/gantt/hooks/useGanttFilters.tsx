
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../utils/taskUtils';
import { getUnifiedLifecycleStatus } from '@/utils/unified-lifecycle-utils';
import { useProjects } from '@/hooks/useProjects';
import type { FilterState } from '../types/ganttTypes';

export const useGanttFilters = (tasks: Task[], filters: FilterState) => {
  const { projects } = useProjects();

  // Create stable task signature for dependency tracking
  const taskSignature = useMemo(() => {
    return `${tasks.length}-${tasks.map(t => `${t.id}-${t.status}-${t.priority}-${t.category || 'none'}`).join('|')}`;
  }, [tasks]);

  // Create stable project signature for dependency tracking
  const projectSignature = useMemo(() => {
    return `${projects.length}-${projects.map(p => p.id).join('|')}`;
  }, [projects]);

  // Create stable filter signature for dependency tracking
  const filterSignature = useMemo(() => {
    return JSON.stringify({
      status: filters.status.sort(),
      priority: filters.priority.sort(),
      category: filters.category.sort(),
      lifecycle_status: filters.lifecycle_status.sort()
    });
  }, [filters.status, filters.priority, filters.category, filters.lifecycle_status]);

  const filteredTasks = useMemo(() => {
    console.log('🔍 useGanttFilters: Filtering tasks with signature:', { taskSignature, filterSignature });
    
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
      
      // Unified lifecycle status filter - filter by project's unified lifecycle status
      if (filters.lifecycle_status.length > 0) {
        const project = projects.find(p => p.id === task.project_id);
        if (project) {
          const projectUnifiedStatus = getUnifiedLifecycleStatus(project);
          if (!filters.lifecycle_status.includes(projectUnifiedStatus)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [taskSignature, filterSignature, projectSignature]);

  // Extract unique values for filter options with stable references
  const filterOptions = useMemo(() => {
    console.log('🎛️ useGanttFilters: Computing filter options');
    
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
  }, [taskSignature, projectSignature]);

  return {
    filteredTasks,
    filterOptions
  };
};
