
import React from 'react';
import { GanttProvider } from '@/contexts/gantt';
import { GanttChartInner } from './gantt/components/GanttChartInner';

interface GanttChartProps {
  projectId: string;
  viewMode?: 'days' | 'weeks' | 'months';
}

export const GanttChart = ({ projectId, viewMode }: GanttChartProps): JSX.Element => {
  return (
    <GanttProvider projectId={projectId} initialViewMode={viewMode}>
      <GanttChartInner projectId={projectId} />
    </GanttProvider>
  );
};
