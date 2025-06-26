
import React, { useState } from 'react';
import { TimelineTaskCard } from './TimelineTaskCard';
import { TimelineEmptyState } from './TimelineEmptyState';
import { TimelineLoadingState } from './TimelineLoadingState';
import { TimelineControls } from './TimelineControls';
import { useTimelineData } from './hooks/useTimelineData';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

interface ProjectTimelineProps {
  projectId?: string;
  filters?: TimelineFilters;
  onTaskNavigate?: (taskId: string) => void;
  onTaskModal?: (taskId: string) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  projectId, 
  filters,
  onTaskNavigate,
  onTaskModal
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const { tasks: sortedTasks, loading } = useTimelineData(projectId || 'all', filters);

  if (loading) {
    return <TimelineLoadingState />;
  }

  if (sortedTasks.length === 0) {
    return <TimelineEmptyState projectId={projectId} filters={filters} />;
  }

  return (
    <div className="space-y-6">
      <TimelineControls
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        taskCount={sortedTasks.length}
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        
        <div className="space-y-6">
          {sortedTasks.map((task) => (
            <TimelineTaskCard
              key={task.id}
              task={task}
              onTaskNavigate={onTaskNavigate}
              onTaskModal={onTaskModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
