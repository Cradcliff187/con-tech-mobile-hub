
import React from 'react';
import { SimpleGanttContainer } from './gantt/components/SimpleGanttContainer';
import { GanttErrorBoundary } from './gantt/components/GanttErrorBoundary';
import { GanttProvider } from '@/contexts/gantt/GanttProvider';

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
        <GanttProvider 
          projectId={projectId} 
          initialViewMode={viewMode}
        >
          <SimpleGanttContainer
            projectId={projectId}
            viewMode={viewMode}
          />
        </GanttProvider>
      </GanttErrorBoundary>
    </div>
  );
};
