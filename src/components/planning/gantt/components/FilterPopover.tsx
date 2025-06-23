
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { FilterSection } from './FilterSection';
import { getStatusMetadata } from '@/types/projectStatus';
import { LifecycleStatus } from '@/types/database';
import type { FilterState, FilterChangeHandler } from '../types/ganttTypes';

interface FilterPopoverProps {
  filters: FilterState;
  onFilterChange: FilterChangeHandler;
}

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

// Lifecycle status options with proper labels
const lifecycleStatusOptions = [
  { value: 'pre_planning', label: 'Pre-Planning' },
  { value: 'planning_active', label: 'Active Planning' },
  { value: 'construction_active', label: 'Construction Active' },
  { value: 'construction_hold', label: 'Construction Hold' },
  { value: 'punch_list_phase', label: 'Punch List' },
  { value: 'project_closeout', label: 'Project Closeout' },
  { value: 'project_completed', label: 'Completed' },
  { value: 'project_cancelled', label: 'Cancelled' }
];

export const FilterPopover = ({ filters, onFilterChange }: FilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
    onFilterChange('lifecycle_status', []);
  };

  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              title="Task Status"
              options={statusOptions}
              selectedValues={filters.status}
              onFilterChange={(value, checked) => handleFilterChange('status', value, checked)}
            />
            <Separator />
            <FilterSection
              title="Priority"
              options={priorityOptions}
              selectedValues={filters.priority}
              onFilterChange={(value, checked) => handleFilterChange('priority', value, checked)}
            />
            <Separator />
            <FilterSection
              title="Category"
              options={categoryOptions}
              selectedValues={filters.category}
              onFilterChange={(value, checked) => handleFilterChange('category', value, checked)}
            />
            <Separator />
            <FilterSection
              title="Project Lifecycle Status"
              options={lifecycleStatusOptions}
              selectedValues={filters.lifecycle_status}
              onFilterChange={(value, checked) => handleFilterChange('lifecycle_status', value, checked)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
