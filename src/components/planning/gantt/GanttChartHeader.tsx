
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface GanttChartHeaderProps {
  totalDays: number;
  completedTasks: number;
  punchListTasks: number;
  localUpdatesCount: number;
  onResetUpdates: () => void;
}

export const GanttChartHeader = ({
  totalDays,
  completedTasks,
  punchListTasks,
  localUpdatesCount,
  onResetUpdates
}: GanttChartHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h3 className="text-lg font-semibold text-slate-800">Construction Timeline</h3>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-orange-600" />
          <span>{totalDays} days</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span>{completedTasks} completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-purple-600" />
          <span>{punchListTasks} punch list</span>
        </div>
        {localUpdatesCount > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <span className="text-xs bg-orange-100 px-2 py-1 rounded">
              {localUpdatesCount} task(s) rescheduled
            </span>
            <button
              onClick={onResetUpdates}
              className="text-xs underline hover:no-underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
