
import { CheckCircle, Play, AlertTriangle, PauseCircle } from 'lucide-react';
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  getTaskPosition, 
  getConstructionPhaseColor, 
  getAssigneeInitials 
} from './ganttUtils';

interface GanttTimelineBarProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  viewMode?: 'days' | 'weeks' | 'months';
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle size={12} className="text-white" />;
    case 'in-progress': return <Play size={12} className="text-white" />;
    case 'blocked': return <AlertTriangle size={12} className="text-white" />;
    case 'on-hold': return <PauseCircle size={12} className="text-white" />;
    default: return null;
  }
};

export const GanttTimelineBar = ({ 
  task, 
  timelineStart, 
  timelineEnd, 
  isSelected = false, 
  onSelect,
  viewMode = 'weeks'
}: GanttTimelineBarProps) => {
  const position = getTaskPosition(task, timelineStart, timelineEnd);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(task.id);
    }
  };

  return (
    <div className="flex-1 relative py-4 px-2 min-h-[120px]">
      <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute inset-y-0 rounded-lg shadow-sm transition-all group ${
                onSelect ? 'cursor-pointer' : ''
              } ${
                isSelected 
                  ? 'ring-2 ring-blue-400 shadow-md' 
                  : 'hover:shadow-md'
              } ${getConstructionPhaseColor(task)}`}
              style={{
                left: `${position.left}%`,
                width: `${Math.max(3, position.width)}%`
              }}
              onClick={handleClick}
            >
              {/* Progress overlay */}
              {task.progress && task.progress > 0 && (
                <div 
                  className="absolute inset-y-0 bg-white bg-opacity-30 rounded-lg transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              )}
              
              {/* Task content */}
              <div className="flex items-center justify-between h-full px-2 text-white">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  {getStatusIcon(task.status)}
                  {position.width > 15 && (
                    <span className="truncate text-xs font-medium">
                      {task.title}
                    </span>
                  )}
                </div>
                
                {/* Progress percentage for wider bars */}
                {position.width > 8 && task.progress && task.progress > 0 && (
                  <span className="text-xs font-bold ml-1">
                    {task.progress}%
                  </span>
                )}
                
                {/* Assignee indicator for longer bars */}
                {position.width > 20 && (
                  <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full text-xs flex items-center justify-center font-medium ml-1">
                    {getAssigneeInitials(task)}
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-semibold">{task.title}</div>
              <div>Progress: {task.progress || 0}%</div>
              <div>Status: {task.status}</div>
              <div>Category: {task.category || 'General'}</div>
              {isSelected && <div className="text-blue-400 font-medium">Selected</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
