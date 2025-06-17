
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

interface TaskBarIndicatorsProps {
  task: Task;
  isSelected: boolean;
  viewMode: 'days' | 'weeks' | 'months';
}

export const TaskBarIndicators = ({ task, isSelected, viewMode }: TaskBarIndicatorsProps) => {
  const { calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const hasActualDates = task.start_date && task.due_date;
  const isOverdue = calculatedEndDate < new Date() && task.status !== 'completed';

  return (
    <>
      {/* Enhanced progress indicator */}
      {task.progress && task.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-md overflow-hidden">
          <div 
            className="h-full bg-white bg-opacity-90 rounded-b-md transition-all duration-300 relative"
            style={{ width: `${task.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-75"></div>
          </div>
        </div>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}

      {/* Calculated dates indicator */}
      {!hasActualDates && (
        <div className="absolute top-0 left-0 w-2 h-2 bg-blue-400 rounded-br-md opacity-75"></div>
      )}

      {/* Priority indicator */}
      {task.priority === 'critical' && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-red-600 border-t-4 border-t-red-600"></div>
      )}

      {/* Touch-friendly selection indicator */}
      {isSelected && viewMode === 'days' && (
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
      )}
    </>
  );
};
