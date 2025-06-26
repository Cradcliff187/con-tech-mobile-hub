
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/database';

interface TaskViewTimestampsProps {
  task: Task;
}

export const TaskViewTimestamps: React.FC<TaskViewTimestampsProps> = ({ task }) => {
  const formatDateTime = (date?: string) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'PPP p');
  };

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
        <div>
          <span className="font-medium">Created:</span>
          <div>{formatDateTime(task.created_at)}</div>
        </div>
        <div>
          <span className="font-medium">Last Updated:</span>
          <div>{formatDateTime(task.updated_at)}</div>
        </div>
      </div>
    </div>
  );
};
