
import React from 'react';
import { Button } from '@/components/ui/button';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { Task } from '@/types/database';
import { format } from 'date-fns';

interface EditTaskViewModeProps {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: Date | undefined;
  onClose: () => void;
}

export const EditTaskViewMode: React.FC<EditTaskViewModeProps> = ({
  title,
  description,
  status,
  priority,
  dueDate,
  onClose
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'No date set';
    return format(date, 'PPP');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Task Title
        </label>
        <div className="text-slate-900 font-medium">{title}</div>
      </div>

      {description && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <div className="text-slate-700 whitespace-pre-wrap">{description}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={status}
            onStatusChange={() => {}}
            showAsDropdown={false}
            size="sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <div className="text-slate-700">{formatPriority(priority)}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Due Date
          </label>
          <div className="text-slate-700">{formatDate(dueDate)}</div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
