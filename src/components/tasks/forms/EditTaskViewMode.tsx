
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { TaskDocumentAttachments } from '../TaskDocumentAttachments';
import { Task } from '@/types/database';
import { format } from 'date-fns';
import { Calendar, Clock, User, Wrench, Target, FileText } from 'lucide-react';

interface EditTaskViewModeProps {
  task: Task;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

export const EditTaskViewMode: React.FC<EditTaskViewModeProps> = ({
  task,
  onClose,
  onSwitchToEdit
}) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return 'No date set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'PPP');
  };

  const formatDateTime = (date?: string) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'PPP p');
  };

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

  const getTaskTypeLabel = (type?: string) => {
    return type === 'punch_list' ? 'Punch List Item' : 'Regular Task';
  };

  const getPunchListCategoryLabel = (category?: string) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Progress Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-slate-500" />
          <label className="text-sm font-medium text-slate-700">Progress</label>
          <span className="text-sm text-slate-500 ml-auto">{task.progress || 0}%</span>
        </div>
        <Progress 
          value={task.progress || 0} 
          className="h-2 bg-slate-100"
        />
      </div>

      {/* Task Details Grid */}
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

      {/* Document Attachments */}
      <div>
        <h4 className="text-sm font-medium text-slate-800 mb-3">Document Attachments</h4>
        <TaskDocumentAttachments task={task} />
      </div>

      {/* Timestamps */}
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
        >
          Close
        </Button>
        <Button 
          type="button" 
          onClick={onSwitchToEdit}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-300"
        >
          Switch to Edit
        </Button>
      </div>
    </div>
  );
};
