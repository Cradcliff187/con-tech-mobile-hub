
import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { getAssigneeName } from '../ganttUtils';

interface UseGanttFiltersProps {
  projectTasks: Task[];
}

export const useGanttFilters = ({ projectTasks }: UseGanttFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
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
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Apply search and filters
  useEffect(() => {
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
    
    setFilteredTasks(filtered);
  }, [projectTasks, searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    filteredTasks,
    handleFilterChange
  };
};
