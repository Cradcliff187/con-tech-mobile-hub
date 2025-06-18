
import { useState, useEffect, useContext, useMemo } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../ganttUtils';
import { GanttContext } from '@/contexts/gantt';

interface UseGanttFiltersProps {
  projectTasks: Task[];
}

export const useGanttFilters = ({ projectTasks }: UseGanttFiltersProps) => {
  // Try to use context if available
  const context = useContext(GanttContext);

  // Local state for backward compatibility
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<{
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  }>({
    status: [],
    priority: [],
    category: [],
    phase: []
  });
  const [localFilteredTasks, setLocalFilteredTasks] = useState<Task[]>([]);

  // Use context state if available, otherwise use local state
  const searchQuery = context?.state.searchQuery ?? localSearchQuery;
  const filters = context?.state.filters ?? localFilters;

  // Get filtered tasks from context or apply local filtering
  const filteredTasks = useMemo(() => {
    if (context) {
      // Use context's optimized filtering
      return context.getFilteredTasks();
    } else {
      // Local filtering for backward compatibility
      let filtered = [...projectTasks];
      
      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          getAssigneeName(task).toLowerCase().includes(query) ||
          (task.category && task.category.toLowerCase().includes(query))
        );
      }
      
      // Apply filters (AND logic)
      if (filters.status.length > 0) {
        filtered = filtered.filter(task => filters.status.includes(task.status));
      }
      
      if (filters.priority.length > 0) {
        filtered = filtered.filter(task => filters.priority.includes(task.priority));
      }
      
      if (filters.category.length > 0) {
        filtered = filtered.filter(task => 
          task.category && filters.category.some(cat => 
            task.category!.toLowerCase().includes(cat.toLowerCase())
          )
        );
      }
      
      return filtered;
    }
  }, [context, projectTasks, searchQuery, filters]);

  // Update local filtered tasks when not using context
  useEffect(() => {
    if (!context) {
      setLocalFilteredTasks(filteredTasks);
    }
  }, [filteredTasks, context]);

  // Handle search query changes
  const setSearchQuery = (query: string) => {
    if (context) {
      context.setSearchQuery(query);
    } else {
      setLocalSearchQuery(query);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, values: string[]) => {
    if (context) {
      context.setFilters({ [filterType]: values });
    } else {
      setLocalFilters(prev => ({
        ...prev,
        [filterType]: values
      }));
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    filteredTasks: context ? filteredTasks : localFilteredTasks,
    handleFilterChange
  };
};
