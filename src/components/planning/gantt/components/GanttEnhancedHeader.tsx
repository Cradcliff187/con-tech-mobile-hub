
import { AlertTriangle } from 'lucide-react';
import { GanttChartHeader } from '../GanttChartHeader';

interface GanttEnhancedHeaderProps {
  totalDays: number;
  completedTasks: number;
  punchListTasks: number;
  localUpdatesCount: number;
  onResetUpdates: () => void;
}

export const GanttEnhancedHeader = ({
  totalDays,
  completedTasks,
  punchListTasks,
  localUpdatesCount,
  onResetUpdates
}: GanttEnhancedHeaderProps) => {
  return (
    <GanttChartHeader
      totalDays={totalDays}
      completedTasks={completedTasks}
      punchListTasks={punchListTasks}
      localUpdatesCount={localUpdatesCount}
      onResetUpdates={onResetUpdates}
    />
  );
};
