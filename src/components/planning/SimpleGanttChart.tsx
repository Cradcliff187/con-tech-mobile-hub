
import React, { useState } from 'react';
import { SimpleGanttContainer } from './gantt/components/SimpleGanttContainer';

interface SimpleGanttChartProps {
  projectId: string;
  viewMode?: 'days' | 'weeks' | 'months';
}

export const SimpleGanttChart = ({ 
  projectId, 
  viewMode = 'weeks' 
}: SimpleGanttChartProps) => {
  return (
    <div className="w-full">
      <SimpleGanttContainer
        projectId={projectId}
        viewMode={viewMode}
      />
    </div>
  );
};
