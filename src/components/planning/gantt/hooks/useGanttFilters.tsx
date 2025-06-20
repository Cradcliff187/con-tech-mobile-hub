
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../utils/taskUtils';
import type { FilterState } from '../types/ganttTypes';

export const useGanttFilters = (tasks: Task[], filters: FilterState) => {
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
      
      return true;
    });
  }, [tasks, filters]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(tasks.map(task => task.status))];
    const priorities = [...new Set(tasks.map(task => task.priority))];
    const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];
    const assignees = [...new Set(tasks.map(task => getAssigneeName(task)))];
    
    return {
      statuses,
      priorities,
      categories,
      assignees
    };
  }, [tasks]);

  return {
    filteredTasks,
    filterOptions
  };
};
