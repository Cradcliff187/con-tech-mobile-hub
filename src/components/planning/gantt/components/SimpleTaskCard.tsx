
import React from 'react';
import { Task } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Clock } from 'lucide-react';

interface SimpleTaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

export const SimpleTaskCard = ({ task, isSelected, onClick }: SimpleTaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDateRange = () => {
    if (!task.start_date || !task.due_date) return 'No dates set';
    
    const start = new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div 
      className={`p-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-25'
      }`}
      onClick={onClick}
    >
      {/* Title */}
      <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Status and Category */}
      <div className="flex gap-2 mb-2">
        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
          {task.status}
        </Badge>
        {task.category && (
          <Badge variant="outline" className="text-xs">
            {task.category}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-600">Progress</span>
          <span className="text-xs font-medium">{task.progress || 0}%</span>
        </div>
        <Progress value={task.progress || 0} className="h-1" />
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
        <Clock size={10} />
        {formatDateRange()}
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <User size={10} />
        {task.assignee_id ? 'Assigned' : 'Unassigned'}
      </div>
    </div>
  );
};
