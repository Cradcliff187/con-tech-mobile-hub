
import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/database';

interface TimelineTaskCardProps {
  task: Task;
  onTaskNavigate?: (taskId: string) => void;
  onTaskModal?: (taskId: string) => void;
}

export const TimelineTaskCard: React.FC<TimelineTaskCardProps> = ({
  task,
  onTaskNavigate,
  onTaskModal
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in-progress':
        return <Clock className="text-orange-500" size={16} />;
      case 'blocked':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-slate-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskClick = () => {
    if (onTaskNavigate) {
      onTaskNavigate(task.id);
    }
  };

  const handleTaskModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskModal) {
      onTaskModal(task.id);
    }
  };

  return (
    <div className="relative flex items-start gap-4">
      {/* Timeline dot */}
      <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getPriorityColor(task.priority)}`}>
      </div>
      
      {/* Task card */}
      <Card 
        className={`flex-1 cursor-pointer hover:shadow-md transition-shadow ${
          isOverdue(task.due_date, task.status) ? 'border-red-200 bg-red-50' : ''
        }`}
        onClick={handleTaskClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(task.status)}
                <h4 className="font-medium text-slate-800">{task.title}</h4>
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-slate-600 mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Due: {formatDate(task.due_date)}
                  {isOverdue(task.due_date, task.status) && (
                    <span className="text-red-600 font-medium ml-1">(Overdue)</span>
                  )}
                </span>
                
                {task.assignee_id && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    Assigned
                  </span>
                )}
                
                {task.category && (
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {task.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTaskModalClick}
                className="h-8 px-2"
              >
                <Eye className="w-3 h-3 mr-1" />
                Details
              </Button>
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-white border-0`}>
                {task.priority}
              </Badge>
              {task.progress !== undefined && (
                <span className="text-sm text-slate-600">{task.progress}%</span>
              )}
            </div>
          </div>
          
          {task.progress !== undefined && (
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
