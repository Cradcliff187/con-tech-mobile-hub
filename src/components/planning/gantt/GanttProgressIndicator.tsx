
import { Task } from '@/types/database';

interface GanttProgressIndicatorProps {
  tasks: Task[];
}

export const GanttProgressIndicator = ({ tasks }: GanttProgressIndicatorProps) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = Math.min(100, (completedTasks / tasks.length) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};
