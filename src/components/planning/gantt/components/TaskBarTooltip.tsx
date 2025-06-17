
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

interface TaskBarTooltipProps {
  task: Task;
  children: React.ReactNode;
  viewMode: 'days' | 'weeks' | 'months';
}

export const TaskBarTooltip = ({ task, children, viewMode }: TaskBarTooltipProps) => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const hasActualDates = task.start_date && task.due_date;
  const isOverdue = calculatedEndDate < new Date() && task.status !== 'completed';

  const formatTooltipDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-white border border-slate-200 shadow-lg">
        <div className="space-y-2 p-1">
          <div className="font-semibold text-slate-800">{task.title}</div>
          <div className="text-sm text-slate-600">
            <strong>Duration:</strong> {formatTooltipDate(calculatedStartDate)} - {formatTooltipDate(calculatedEndDate)}
            {!hasActualDates && <span className="text-blue-600"> (calculated)</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Status:</strong> {task.status}</div>
            <div><strong>Priority:</strong> {task.priority}</div>
          </div>
          {task.estimated_hours && (
            <div className="text-sm text-slate-600">
              <strong>Est. Hours:</strong> {task.estimated_hours}h
            </div>
          )}
          {task.progress && task.progress > 0 && (
            <div className="text-sm text-slate-600">
              <strong>Progress:</strong> {task.progress}%
            </div>
          )}
          {task.category && (
            <div className="text-sm text-slate-600">
              <strong>Phase:</strong> {task.category}
            </div>
          )}
          {isOverdue && (
            <div className="text-sm text-red-600 font-medium">
              ⚠️ Overdue
            </div>
          )}
          <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
            View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
