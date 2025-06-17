
import { User, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/database';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  getAssigneeName, 
  formatDateRange, 
  getCategoryBadgeColor 
} from './ganttUtils';

interface GanttTaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />;
    case 'high': return <AlertTriangle size={14} className="text-orange-600 flex-shrink-0" />;
    default: return null;
  }
};

export const GanttTaskCard = ({ task, isSelected = false, onSelect }: GanttTaskCardProps) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(task.id);
    }
  };

  return (
    <div 
      className={`w-80 lg:w-96 border-r border-slate-200 transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-blue-400 bg-blue-50' 
          : 'hover:bg-slate-25'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Priority + Title */}
        <div className="flex items-start gap-2 mb-3">
          {getPriorityIcon(task.priority)}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold line-clamp-2 leading-tight ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}>
              {task.title}
            </h4>
          </div>
        </div>
        
        {/* Category + Type Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {task.category && (
            <Badge className={`text-xs px-2 py-1 ${getCategoryBadgeColor(task.category)}`}>
              {task.category}
            </Badge>
          )}
          {task.task_type === 'punch_list' && (
            <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
              Punch List
            </Badge>
          )}
        </div>
        
        {/* Assignee + Progress */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate">{getAssigneeName(task)}</span>
          </div>
          <span className={`text-sm font-semibold ${
            isSelected ? 'text-blue-800' : 'text-slate-800'
          }`}>{task.progress || 0}%</span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={task.progress || 0} className="h-2 mb-3" />
        
        {/* Dates */}
        <div className="text-xs text-slate-500 mb-2">
          {formatDateRange(task.start_date, task.due_date)}
        </div>

        {/* Required Skills */}
        {task.required_skills && task.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.required_skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {task.required_skills.length > 2 && (
              <span className="text-xs text-slate-500">+{task.required_skills.length - 2} more</span>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};
