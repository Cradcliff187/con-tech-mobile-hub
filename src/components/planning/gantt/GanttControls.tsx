import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, X, Eye, EyeOff, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { FilterState, FilterChangeHandler } from './types/ganttTypes';

interface GanttControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFilterChange: FilterChangeHandler;
  viewMode: 'days' | 'weeks' | 'months';
  onViewModeChange: (mode: 'days' | 'weeks' | 'months') => void;
  isDebugMode?: boolean;
  onToggleDebugMode?: () => void;
  isDevelopment?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const GanttControls = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  isDebugMode = false,
  onToggleDebugMode,
  isDevelopment = false,
  isCollapsed = false,
  onToggleCollapse
}: GanttControlsProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add debugging log for collapse controls
  console.log('🎛️ GanttControls: isCollapsed=', isCollapsed, 'onToggleCollapse=', !!onToggleCollapse);

  const statusOptions = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const categoryOptions = [
    { value: 'foundation', label: 'Foundation' },
    { value: 'framing', label: 'Framing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'siding', label: 'Siding' },
    { value: 'interior', label: 'Interior' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' }
  ];

  const phaseOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'punch_list', label: 'Punch List' },
    { value: 'closeout', label: 'Closeout' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterType];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFilterChange(filterType, newValues);
  };

  const clearFilters = () => {
    onFilterChange('status', []);
    onFilterChange('priority', []);
    onFilterChange('category', []);
    onFilterChange('phase', []);
  };

  const activeFilterCount = Object.values(filters).flat().length;

  const FilterSection = ({ title, options, filterKey }: {
    title: string;
    options: { value: string; label: string }[];
    filterKey: keyof FilterState;
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-slate-700">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterKey}-${option.value}`}
              checked={filters[filterKey].includes(option.value)}
              onCheckedChange={(checked) =>
                handleFilterChange(filterKey, option.value, checked as boolean)
              }
            />
            <label
              htmlFor={`${filterKey}-${option.value}`}
              className="text-sm font-normal text-slate-600 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        {/* Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter size={16} className="mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-orange-600">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Filter Tasks</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X size={14} className="mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                <FilterSection
                  title="Status"
                  options={statusOptions}
                  filterKey="status"
                />
                <Separator />
                <FilterSection
                  title="Priority"
                  options={priorityOptions}
                  filterKey="priority"
                />
                <Separator />
                <FilterSection
                  title="Category"
                  options={categoryOptions}
                  filterKey="category"
                />
                <Separator />
                <FilterSection
                  title="Phase"
                  options={phaseOptions}
                  filterKey="phase"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <Button
            variant="outline"
            onClick={() => {
              console.log('🔄 GanttControls: Collapse toggle clicked, current state:', isCollapsed);
              onToggleCollapse();
            }}
            className="flex items-center gap-2"
            title={isCollapsed ? "Expand task cards" : "Collapse task cards"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {/* View Mode */}
        <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="days" className="text-xs">Days</TabsTrigger>
            <TabsTrigger value="weeks" className="text-xs">Weeks</TabsTrigger>
            <TabsTrigger value="months" className="text-xs">Months</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Debug Mode (Development Only) */}
        {isDevelopment && onToggleDebugMode && (
          <Button
            variant={isDebugMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleDebugMode}
            className="flex items-center gap-2"
          >
            <Bug size={14} />
            Debug
          </Button>
        )}
      </div>
    </div>
  );
};
