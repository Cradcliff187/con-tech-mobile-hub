
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface FilterState {
  status: string;
  phase: string;
  client: string;
}

interface ProjectsListFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  filterOptions: {
    statuses: string[];
    phases: string[];
    clients: string[];
  };
  activeFiltersCount: number;
}

export const ProjectsListFilters = ({
  searchQuery,
  setSearchQuery,
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions,
  activeFiltersCount
}: ProjectsListFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {filterOptions.statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'cancelled' ? 'Archived' : status.replace('-', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.phase} onValueChange={(value) => onFilterChange('phase', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {filterOptions.phases.map(phase => (
              <SelectItem key={phase} value={phase}>
                {phase.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.client} onValueChange={(value) => onFilterChange('client', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {filterOptions.clients.map(client => (
              <SelectItem key={client} value={client}>
                {client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1"
          >
            <X size={14} />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
};
