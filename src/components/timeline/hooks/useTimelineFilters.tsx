
import { useState, useMemo } from 'react';
import { Task } from '@/types/database';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

export const useTimelineFilters = (tasks: Task[]) => {
  const [filters, setFilters] = useState<TimelineFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  const handleFilterChange = (filterType: keyof TimelineFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const { categories, priorities } = useMemo(() => {
    const uniqueCategories = [...new Set(tasks.filter(task => task.category).map(task => task.category))];
    const uniquePriorities = ['low', 'medium', 'high', 'critical'];
    
    return {
      categories: uniqueCategories,
      priorities: uniquePriorities
    };
  }, [tasks]);

  return {
    filters,
    categories,
    priorities,
    handleFilterChange
  };
};
