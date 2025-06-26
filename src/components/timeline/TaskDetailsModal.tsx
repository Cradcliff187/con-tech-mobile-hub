
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/database';
import { format } from 'date-fns';

interface TaskDetailsModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailsModal = ({ task, open, onOpenChange }: TaskDetailsModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status and Priority */}
          <div className="flex gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('-', ' ')}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Description</h4>
              <p className="text-slate-600 text-sm">{task.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {task.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Start Date</p>
                  <p className="font-medium">{format(new Date(task.start_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}
            
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Due Date</p>
                  <p className="font-medium">{format(new Date(task.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {task.progress !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hours */}
          {(task.estimated_hours || task.actual_hours) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {task.estimated_hours && (
                <div>
                  <p className="text-slate-500">Estimated Hours</p>
                  <p className="font-medium">{task.estimated_hours}h</p>
                </div>
              )}
              {task.actual_hours && (
                <div>
                  <p className="text-slate-500">Actual Hours</p>
                  <p className="font-medium">{task.actual_hours}h</p>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          {task.category && (
            <div className="text-sm">
              <p className="text-slate-500">Category</p>
              <p className="font-medium">{task.category}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
