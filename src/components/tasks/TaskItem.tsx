
import React from 'react';
import { Task } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Calendar, Clock } from 'lucide-react';
import { TaskDocumentAttachments } from './TaskDocumentAttachments';
import { format } from 'date-fns';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  isSelected?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onViewDetails, 
  isSelected = false 
}) => {
  const { updateTask } = useTasks();
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task.id, { status: newStatus });
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200 hover:shadow-md
      ${isSelected ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}
      ${isOverdue ? 'border-red-300 bg-red-50' : ''}
    `}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              <h3 className="font-medium text-slate-800 truncate">{task.title}</h3>
              {task.task_type === 'punch_list' && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                  Punch List
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(task)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
            >
              <Eye size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
            >
              <Edit size={16} />
            </Button>
          </div>
        </div>

        {/* Status and Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobalStatusDropdown
              entityType="task"
              currentStatus={task.status}
              onStatusChange={handleStatusChange}
              size="sm"
              confirmCriticalChanges={true}
            />
            {task.progress !== undefined && task.progress > 0 && (
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <span>{task.progress}%</span>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className={`flex items-center gap-1 text-sm ${
              isOverdue ? 'text-red-600' : 'text-slate-500'
            }`}>
              <Calendar size={14} />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
              {isOverdue && <span className="font-medium">(Overdue)</span>}
            </div>
          )}
        </div>

        {/* Hours and Skills */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {task.estimated_hours && (
              <div className="flex items-center gap-1 text-slate-500">
                <Clock size={14} />
                <span>{task.estimated_hours}h estimated</span>
                {task.actual_hours && (
                  <span className="text-slate-400">
                    / {task.actual_hours}h actual
                  </span>
                )}
              </div>
            )}
            
            {task.required_skills && task.required_skills.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Skills:</span>
                <div className="flex gap-1">
                  {task.required_skills.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {task.required_skills.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.required_skills.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Document Attachments Indicator */}
          <TaskDocumentAttachments task={task} compact />
        </div>

        {/* Category and Punch List Info */}
        {(task.category || task.punch_list_category) && (
          <div className="flex items-center gap-2 text-sm">
            {task.category && (
              <Badge variant="secondary" className="text-xs">
                {task.category}
              </Badge>
            )}
            {task.punch_list_category && (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                {task.punch_list_category}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
