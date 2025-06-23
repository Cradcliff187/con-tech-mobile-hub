
import { User, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/database';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getAssigneeName } from './utils/taskUtils';

interface GanttCollapsedTaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle size={10} className="text-red-600 flex-shrink-0" />;
    case 'high': return <AlertTriangle size={10} className="text-orange-600 flex-shrink-0" />;
    default: return null;
  }
};

export const GanttCollapsedTaskCard = ({ task, isSelected = false, onSelect }: GanttCollapsedTaskCardProps) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(task.id);
    }
  };

  return (
    <div 
      className={`w-64 lg:w-72 border-r border-slate-200 transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-blue-400 bg-blue-50' 
          : 'hover:bg-slate-25'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-1.5 py-1"> {/* Further reduced padding */}
        <div className="flex items-center justify-between">
          {/* Left side: Priority + Title */}
          <div className="flex items-center gap-1 flex-1 min-w-0"> {/* Reduced gap */}
            {getPriorityIcon(task.priority)}
            <h4 className={`text-xs font-medium truncate ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}> {/* Reduced text size */}
              {task.title}
            </h4>
          </div>
          
          {/* Right side: Progress */}
          <div className="flex items-center gap-1 flex-shrink-0"> {/* Reduced gap */}
            <span className={`text-xs font-semibold ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}>{task.progress || 0}%</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={task.progress || 0} className="h-1 mt-0.5" /> {/* Reduced margin */}
      </CardContent>
    </div>
  );
};
