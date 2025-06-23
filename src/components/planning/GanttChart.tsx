
import React from 'react';
import { GanttProvider } from '@/contexts/gantt';
import { GanttChartInner } from './gantt/components/GanttChartInner';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart = ({ projectId }: GanttChartProps): JSX.Element => {
  return (
    <GanttProvider projectId={projectId}>
      <GanttChartInner projectId={projectId} />
    </GanttProvider>
  );
};
