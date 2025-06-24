
import React, { useState } from 'react';
import { SimpleGanttContainer } from './gantt/components/SimpleGanttContainer';
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
        <SimpleGanttContainer
          projectId={projectId}
          viewMode={viewMode}
        />
      </GanttErrorBoundary>
    </div>
  );
};
