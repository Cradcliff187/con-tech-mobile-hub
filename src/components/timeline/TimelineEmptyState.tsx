
import React from 'react';
import { Calendar } from 'lucide-react';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

interface TimelineEmptyStateProps {
  projectId: string;
  filters?: TimelineFilters;
}

export const TimelineEmptyState: React.FC<TimelineEmptyStateProps> = ({
  projectId,
  filters
}) => {
  const hasActiveFilters = filters && (
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.priority !== 'all'
  );

  return (
    <div className="text-center py-12">
      <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-medium text-slate-600 mb-2">
        {hasActiveFilters ? 'No Tasks Match Filters' : 'No Tasks Found'}
      </h3>
      <p className="text-slate-500">
        {hasActiveFilters 
          ? 'Try adjusting your filters to see more tasks.' 
          : projectId && projectId !== 'all' 
            ? 'No tasks found for this project.' 
            : 'Create a project and add tasks to see the timeline.'
        }
      </p>
    </div>
  );
};
