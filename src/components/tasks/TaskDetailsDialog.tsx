
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/database';
import { TaskDocumentAttachments } from './TaskDocumentAttachments';
import { format } from 'date-fns';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ 
  task, 
  open, 
  onOpenChange 
}) => {
  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <Badge className={`mt-1 ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Priority</label>
              <Badge className={`mt-1 ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
            {task.due_date && (
              <div>
                <label className="text-sm font-medium text-slate-600">Due Date</label>
                <p className="text-sm text-slate-800 mt-1">
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            {task.progress !== undefined && (
              <div>
                <label className="text-sm font-medium text-slate-600">Progress</label>
                <p className="text-sm text-slate-800 mt-1">{task.progress}%</p>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-sm font-medium text-slate-600">Description</label>
              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            {task.task_type && (
              <div>
                <label className="text-sm font-medium text-slate-600">Task Type</label>
                <p className="text-sm text-slate-800 mt-1 capitalize">
                  {task.task_type.replace('_', ' ')}
                </p>
              </div>
            )}
            {task.category && (
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <p className="text-sm text-slate-800 mt-1">{task.category}</p>
              </div>
            )}
          </div>

          {/* Hours */}
          {(task.estimated_hours || task.actual_hours) && (
            <div className="grid grid-cols-2 gap-4">
              {task.estimated_hours && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Estimated Hours</label>
                  <p className="text-sm text-slate-800 mt-1">{task.estimated_hours}h</p>
                </div>
              )}
              {task.actual_hours && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Actual Hours</label>
                  <p className="text-sm text-slate-800 mt-1">{task.actual_hours}h</p>
                </div>
              )}
            </div>
          )}

          {/* Required Skills */}
          {task.required_skills && task.required_skills.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-600">Required Skills</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.required_skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Punch List Category */}
          {task.task_type === 'punch_list' && task.punch_list_category && (
            <div>
              <label className="text-sm font-medium text-slate-600">Punch List Category</label>
              <Badge className="mt-1 bg-orange-100 text-orange-800">
                {task.punch_list_category}
              </Badge>
            </div>
          )}

          {/* Document Attachments */}
          <div className="border-t border-slate-200 pt-4">
            <TaskDocumentAttachments task={task} />
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
            <div>
              <span className="font-medium">Created:</span> {format(new Date(task.created_at), 'MMM d, yyyy HH:mm')}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {format(new Date(task.updated_at), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
