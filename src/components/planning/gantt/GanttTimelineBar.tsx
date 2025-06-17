
import { Task } from '@/types/database';
import { getTaskPosition, getConstructionPhaseColor, calculateTaskDatesFromEstimate, formatDateRange } from './ganttUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GanttTimelineBarProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
}

export const GanttTimelineBar = ({
  task,
  timelineStart,
  timelineEnd,
  isSelected,
  onSelect,
  viewMode,
  isDragging = false,
  onDragStart,
  onDragEnd
}: GanttTimelineBarProps) => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const position = getTaskPosition(task, timelineStart, timelineEnd);
  const phaseColor = getConstructionPhaseColor(task);
  
  const handleClick = () => {
    onSelect(task.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const formatTooltipDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTaskDisplayText = () => {
    if (viewMode === 'days') {
      return task.title.slice(0, 20) + (task.title.length > 20 ? '...' : '');
    } else if (viewMode === 'weeks') {
      return task.title.slice(0, 15) + (task.title.length > 15 ? '...' : '');
    } else {
      return task.title.slice(0, 10) + (task.title.length > 10 ? '...' : '');
    }
  };

  return (
    <div className="relative h-16 flex-1 border-r border-slate-200">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute top-3 h-10 rounded ${phaseColor} cursor-pointer transition-all duration-200 hover:opacity-80 ${
              isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''
            } ${isDragging ? 'opacity-50 z-10' : ''}`}
            style={{
              left: `${position.left}%`,
              width: `${position.width}%`,
              minWidth: '8px'
            }}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="px-2 py-1 text-white text-xs font-medium truncate">
              {position.width > 8 ? getTaskDisplayText() : ''}
            </div>
            
            {/* Progress indicator */}
            {task.progress && task.progress > 0 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-50 rounded-b"
                style={{ width: `${task.progress}%` }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm">
              <strong>Duration:</strong> {formatTooltipDate(calculatedStartDate)} - {formatTooltipDate(calculatedEndDate)}
            </div>
            <div className="text-sm">
              <strong>Status:</strong> {task.status}
            </div>
            <div className="text-sm">
              <strong>Priority:</strong> {task.priority}
            </div>
            {task.estimated_hours && (
              <div className="text-sm">
                <strong>Estimated Hours:</strong> {task.estimated_hours}
              </div>
            )}
            {task.progress && task.progress > 0 && (
              <div className="text-sm">
                <strong>Progress:</strong> {task.progress}%
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
