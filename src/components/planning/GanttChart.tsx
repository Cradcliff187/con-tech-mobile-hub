
import React from 'react';
import { SimpleGanttChart } from './SimpleGanttChart';

interface GanttChartProps {
  projectId: string;
  viewMode?: 'days' | 'weeks' | 'months';
}

export const GanttChart = ({ projectId, viewMode = 'weeks' }: GanttChartProps): JSX.Element => {
  return (
    <div className="w-full">
      <SimpleGanttChart 
        projectId={projectId} 
        viewMode={viewMode} 
      />
    </div>
  );
};
