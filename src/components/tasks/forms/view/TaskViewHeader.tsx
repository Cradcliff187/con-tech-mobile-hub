
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { Task } from '@/types/database';

interface TaskViewHeaderProps {
  task: Task;
}

export const TaskViewHeader: React.FC<TaskViewHeaderProps> = ({ task }) => {
  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="border-b border-slate-200 pb-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(task.priority)}>
            {formatPriority(task.priority)}
          </Badge>
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={task.status}
            onStatusChange={() => {}}
            showAsDropdown={false}
            size="sm"
          />
        </div>
      </div>
      
      {task.description && (
        <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
          {task.description}
        </div>
      )}
    </div>
  );
};
