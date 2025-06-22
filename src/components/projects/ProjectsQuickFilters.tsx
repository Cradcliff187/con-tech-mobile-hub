
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuickFilter {
  key: string;
  label: string;
  count: number;
}

interface ProjectsQuickFiltersProps {
  quickFilters: QuickFilter[];
  activeFilter: string;
  onFilterClick: (filterKey: string) => void;
}

export const ProjectsQuickFilters = ({
  quickFilters,
  activeFilter,
  onFilterClick
}: ProjectsQuickFiltersProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {quickFilters.map((filter) => (
        <Button
          key={filter.key}
          variant="ghost"
          size="sm"
          onClick={() => onFilterClick(filter.key)}
          className={`flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
            activeFilter === filter.key
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{filter.label}</span>
          <Badge variant="secondary" className="text-xs">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
