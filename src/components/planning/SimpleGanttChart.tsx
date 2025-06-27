
import React from 'react';
import { UnifiedGanttContainer } from './gantt/components/UnifiedGanttContainer';
import { GanttErrorBoundary } from './gantt/components/GanttErrorBoundary';

interface SimpleGanttChartProps {
  projectId: string;
  viewMode?: 'days' | 'weeks' | 'months';
}

export const SimpleGanttChart = ({ 
  projectId, 
  viewMode = 'weeks' 
}: SimpleGanttChartProps) => {
  return (
    <div className="w-full h-full">
      <GanttErrorBoundary>
        <UnifiedGanttContainer
          projectId={projectId}
          viewMode={viewMode}
        />
      </GanttErrorBoundary>
    </div>
  );
};
