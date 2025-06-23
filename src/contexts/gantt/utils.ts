
import { Task } from '@/types/database';
import { LifecycleStatus } from '@/types/database';
import { getAssigneeName } from '@/components/planning/gantt/utils/taskUtils';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { startOfMonth, endOfMonth, addMonths, subDays, addDays, min, max } from 'date-fns';

// Helper function to check if task matches search query
export const matchesSearch = (task: Task, query: string): boolean => {
  const searchLower = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(searchLower) ||
    (task.description && task.description.toLowerCase().includes(searchLower)) ||
    getAssigneeName(task).toLowerCase().includes(searchLower) ||
    (task.category && task.category.toLowerCase().includes(searchLower))
  );
};

// Calculate timeline bounds based on filtered tasks
export const calculateTimelineBounds = (tasks: Task[]) => {
  const tasksWithDates = tasks.filter(task => 
    task.start_date || task.due_date
  );
  
  if (tasksWithDates.length === 0) {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(addMonths(now, 2))
    };
  }
  
  const allDates = tasksWithDates.flatMap(task => [
    task.start_date ? new Date(task.start_date) : null,
    task.due_date ? new Date(task.due_date) : null
  ]).filter((date): date is Date => date !== null);
  
  return {
    start: subDays(min(allDates), 7),
    end: addDays(max(allDates), 7)
  };
};

// Apply filters to tasks - updated to use lifecycle_status
export const applyTaskFilters = (
  tasks: Task[],
  optimisticUpdates: Map<string, Partial<Task>>,
  searchQuery: string,
  filters: {
    status: string[];
    priority: string[];
    category: string[];
    lifecycle_status: LifecycleStatus[];
  },
  projects?: Array<{ id: string; [key: string]: any }>
): Task[] => {
  return tasks
    .map(task => {
      const optimisticUpdate = optimisticUpdates.get(task.id);
      return optimisticUpdate ? { ...task, ...optimisticUpdate } : task;
    })
    .filter(task => {
      // Apply search filter
      if (searchQuery.trim() && !matchesSearch(task, searchQuery)) {
        return false;
      }
      
      // Apply status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Apply priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Apply category filter
      if (filters.category.length > 0 && task.category) {
        const hasMatchingCategory = filters.category.some(cat =>
          task.category!.toLowerCase().includes(cat.toLowerCase())
        );
        if (!hasMatchingCategory) return false;
      }
      
      // Apply lifecycle status filter - filter by project's lifecycle status
      if (filters.lifecycle_status.length > 0 && projects) {
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
};
