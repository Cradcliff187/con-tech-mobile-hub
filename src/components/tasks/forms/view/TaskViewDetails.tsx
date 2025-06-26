
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Wrench, FileText } from 'lucide-react';
import { Task } from '@/types/database';

interface TaskViewDetailsProps {
  task: Task;
}

export const TaskViewDetails: React.FC<TaskViewDetailsProps> = ({ task }) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return 'No date set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'PPP');
  };

  const getTaskTypeLabel = (type?: string) => {
    return type === 'punch_list' ? 'Punch List Item' : 'Regular Task';
  };

  const getPunchListCategoryLabel = (category?: string) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-slate-500" />
            <label className="text-sm font-medium text-slate-700">Task Type</label>
          </div>
          <div className="text-sm text-slate-600">{getTaskTypeLabel(task.task_type)}</div>
        </div>

        {task.category && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <div className="text-sm text-slate-600">{task.category}</div>
          </div>
        )}

        {task.task_type === 'punch_list' && task.punch_list_category && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Punch List Category</label>
            <Badge variant="secondary" className="text-xs">
              {getPunchListCategoryLabel(task.punch_list_category)}
            </Badge>
          </div>
        )}

        {/* Hours Tracking */}
        {(task.estimated_hours || task.actual_hours) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700">Hours Tracking</label>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Estimated:</span>
                <div className="font-medium text-slate-700">
                  {task.estimated_hours ? `${task.estimated_hours}h` : 'Not set'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Actual:</span>
                <div className="font-medium text-slate-700">
                  {task.actual_hours ? `${task.actual_hours}h` : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Dates */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <label className="text-sm font-medium text-slate-700">Dates</label>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Start:</span>
              <div className="text-slate-700">{formatDate(task.start_date)}</div>
            </div>
            <div>
              <span className="text-slate-500">Due:</span>
              <div className="text-slate-700">{formatDate(task.due_date)}</div>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        {task.required_skills && task.required_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700">Required Skills</label>
            </div>
            <div className="flex flex-wrap gap-1">
              {task.required_skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
