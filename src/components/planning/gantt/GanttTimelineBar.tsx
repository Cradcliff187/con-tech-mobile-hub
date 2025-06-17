
import { Task } from '@/types/database';
import { getTaskPosition, getConstructionPhaseColor, calculateTaskDatesFromEstimate } from './ganttUtils';
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

  const getViewModeConfig = () => {
    switch (viewMode) {
      case 'days':
        return {
          minWidth: '12px',
          textLength: 25,
          fontSize: 'text-xs',
          height: 'h-8',
          topOffset: 'top-4'
        };
      case 'weeks':
        return {
          minWidth: '16px',
          textLength: 20,
          fontSize: 'text-xs',
          height: 'h-10',
          topOffset: 'top-3'
        };
      case 'months':
        return {
          minWidth: '24px',
          textLength: 15,
          fontSize: 'text-sm',
          height: 'h-12',
          topOffset: 'top-2'
        };
      default:
        return {
          minWidth: '16px',
          textLength: 20,
          fontSize: 'text-xs',
          height: 'h-10',
          topOffset: 'top-3'
        };
    }
  };

  const config = getViewModeConfig();
  
  const getTaskDisplayText = () => {
    return task.title.slice(0, config.textLength) + (task.title.length > config.textLength ? '...' : '');
  };

  const getBarHeight = () => {
    switch (viewMode) {
      case 'days': return 'h-16';
      case 'weeks': return 'h-16';
      case 'months': return 'h-20';
      default: return 'h-16';
    }
  };

  return (
    <div className={`relative ${getBarHeight()} flex-1 border-r border-slate-200`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute ${config.topOffset} ${config.height} rounded-md ${phaseColor} cursor-pointer transition-all duration-200 hover:opacity-80 hover:shadow-md ${
              isSelected ? 'ring-2 ring-orange-500 shadow-lg scale-105' : ''
            } ${isDragging ? 'opacity-50 z-10' : ''}`}
            style={{
              left: `${position.left}%`,
              width: `${position.width}%`,
              minWidth: config.minWidth
            }}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
          >
            <div className={`px-2 py-1 text-white ${config.fontSize} font-medium truncate`}>
              {position.width > (viewMode === 'days' ? 5 : viewMode === 'weeks' ? 8 : 12) ? getTaskDisplayText() : ''}
            </div>
            
            {/* Enhanced progress indicator */}
            {task.progress && task.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-md">
                <div 
                  className="h-full bg-white bg-opacity-80 rounded-b-md transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}

            {/* View mode specific indicators */}
            {viewMode === 'days' && isSelected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-white border border-slate-200 shadow-lg">
          <div className="space-y-2 p-1">
            <div className="font-semibold text-slate-800">{task.title}</div>
            <div className="text-sm text-slate-600">
              <strong>Duration:</strong> {formatTooltipDate(calculatedStartDate)} - {formatTooltipDate(calculatedEndDate)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Status:</strong> {task.status}</div>
              <div><strong>Priority:</strong> {task.priority}</div>
            </div>
            {task.estimated_hours && (
              <div className="text-sm text-slate-600">
                <strong>Est. Hours:</strong> {task.estimated_hours}h
              </div>
            )}
            {task.progress && task.progress > 0 && (
              <div className="text-sm text-slate-600">
                <strong>Progress:</strong> {task.progress}%
              </div>
            )}
            <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
              View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
