
import { AlertTriangle } from 'lucide-react';
import { GanttChartHeader } from '../GanttChartHeader';
import { MigrationButton } from '@/utils/taskDateMigration';
import { Task } from '@/types/database';

interface GanttEnhancedHeaderProps {
  totalDays: number;
  completedTasks: number;
  punchListTasks: number;
  localUpdatesCount: number;
  onResetUpdates: () => void;
  tasks?: Task[];
}

export const GanttEnhancedHeader = ({
  totalDays,
  completedTasks,
  punchListTasks,
  localUpdatesCount,
  onResetUpdates,
  tasks = []
}: GanttEnhancedHeaderProps) => {
  // Check if there are any tasks with 2024 dates that need migration
  const tasksNeedingMigration = tasks.filter(task => {
    const startYear = task.start_date ? new Date(task.start_date).getFullYear() : null;
    const dueYear = task.due_date ? new Date(task.due_date).getFullYear() : null;
    return startYear === 2024 || dueYear === 2024;
  });

  const showMigrationButton = tasksNeedingMigration.length > 0;

  return (
    <div className="space-y-4">
      <GanttChartHeader
        totalDays={totalDays}
        completedTasks={completedTasks}
        punchListTasks={punchListTasks}
        localUpdatesCount={localUpdatesCount}
        onResetUpdates={onResetUpdates}
      />
      
      {showMigrationButton && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm text-amber-800">
              {tasksNeedingMigration.length} task(s) have 2024 dates that need updating
            </span>
          </div>
          <MigrationButton tasks={tasksNeedingMigration} />
        </div>
      )}
    </div>
  );
};
