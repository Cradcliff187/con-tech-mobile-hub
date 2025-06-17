
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';

interface TimelineHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Timeline</h1>
        <p className="text-gray-600 mt-1">Track project progress and task dependencies</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToggleFilters}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
