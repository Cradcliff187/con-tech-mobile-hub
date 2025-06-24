
import React from 'react';
import { Task } from '@/types/database';
import { AlertTriangle, Clock } from 'lucide-react';

interface TaskBarIndicatorsProps {
  task: Task;
  isSelected: boolean;
  viewMode: 'days' | 'weeks' | 'months';
}

export const TaskBarIndicators = ({ task, isSelected, viewMode }: TaskBarIndicatorsProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const isCritical = task.priority === 'critical';

  return (
    <>
      {/* Priority indicator */}
      {isCritical && (
        <div className="absolute -top-1 -right-1">
          <AlertTriangle size={12} className="text-white drop-shadow-sm" />
        </div>
      )}
      
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute -top-1 -left-1">
          <Clock size={12} className="text-red-500 drop-shadow-sm" />
        </div>
      )}
      
      {/* Progress indicator */}
      {task.progress && task.progress > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
          style={{ width: `${task.progress}%` }}
        />
      )}
    </>
  );
};
