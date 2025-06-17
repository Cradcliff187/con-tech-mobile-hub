
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface GanttControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  };
  onFilterChange: (filterType: string, values: string[]) => void;
  viewMode: 'days' | 'weeks' | 'months';
  onViewModeChange: (mode: 'days' | 'weeks' | 'months') => void;
}

export const GanttControls = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange
}: GanttControlsProps) => {
  const statusOptions = ['not-started', 'in-progress', 'completed', 'blocked'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];
  const categoryOptions = ['foundation', 'framing', 'electrical', 'plumbing', 'hvac', 'finishing'];
  const phaseOptions = ['planning', 'active', 'punch_list', 'closeout', 'completed'];

  const handleFilterSelect = (filterType: string, value: string) => {
    const currentValues = filters[filterType as keyof typeof filters];
    const newValues = value === 'all' ? [] : [value];
    onFilterChange(filterType, newValues);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      {/* Search and View Mode Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search tasks and assignees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(['days', 'weeks', 'months'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange(mode)}
              className={`rounded-none first:rounded-l-md last:rounded-r-md ${
                viewMode === mode ? 'bg-orange-600 text-white' : 'hover:bg-slate-50'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} />
          Filters:
        </div>

        {/* Status Filter */}
        <Select 
          value={filters.status.length > 0 ? filters.status[0] : 'all'} 
          onValueChange={(value) => handleFilterSelect('status', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select 
          value={filters.priority.length > 0 ? filters.priority[0] : 'all'} 
          onValueChange={(value) => handleFilterSelect('priority', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select 
          value={filters.category.length > 0 ? filters.category[0] : 'all'} 
          onValueChange={(value) => handleFilterSelect('category', value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phase Filter */}
        <Select 
          value={filters.phase.length > 0 ? filters.phase[0] : 'all'} 
          onValueChange={(value) => handleFilterSelect('phase', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {phaseOptions.map((phase) => (
              <SelectItem key={phase} value={phase}>
                {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
