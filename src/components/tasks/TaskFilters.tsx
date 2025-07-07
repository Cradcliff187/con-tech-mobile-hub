
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ViewToggle } from '@/components/stakeholders/ViewToggle';

interface TaskFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  tasks?: any[];
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
}

export const TaskFilters = ({ 
  currentFilter, 
  onFilterChange, 
  searchTerm, 
  onSearchChange,
  tasks = [],
  view = 'list',
  onViewChange
}: TaskFiltersProps) => {
  const getStatusCount = (status: string) => {
    if (status === 'all') return tasks.length;
    return tasks.filter(task => task.status === status).length;
  };

  const filters = [
    { id: 'all', label: 'All Tasks', count: getStatusCount('all') },
    { id: 'not-started', label: 'Pending', count: getStatusCount('not-started') },
    { id: 'in-progress', label: 'In Progress', count: getStatusCount('in-progress') },
    { id: 'completed', label: 'Completed', count: getStatusCount('completed') }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search tasks or assignees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {onViewChange && (
          <ViewToggle view={view} onViewChange={onViewChange} />
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={currentFilter === filter.id ? "default" : "outline"}
            onClick={() => onFilterChange(filter.id)}
            className={`${
              currentFilter === filter.id 
                ? "bg-blue-600 text-white" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </div>
    </div>
  );
};
