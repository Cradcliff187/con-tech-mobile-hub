
import { Task } from '@/types/database';
import { getTaskGridPosition, getColumnWidth, calculateTaskDatesFromEstimate } from './ganttUtils';
import { getConstructionPhaseColor } from './ganttUtils';
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
  const gridPosition = getTaskGridPosition(task, timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
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
          minWidth: '16px',
          textLength: 25,
          fontSize: 'text-xs',
          height: 'h-8',
          topOffset: 'top-4',
          showText: true
        };
      case 'weeks':
        return {
          minWidth: '20px',
          textLength: 20,
          fontSize: 'text-xs',
          height: 'h-10',
          topOffset: 'top-3',
          showText: true
        };
      case 'months':
        return {
          minWidth: '24px',
          textLength: 15,
          fontSize: 'text-sm',
          height: 'h-12',
          topOffset: 'top-2',
          showText: true
        };
      default:
        return {
          minWidth: '20px',
          textLength: 20,
          fontSize: 'text-xs',
          height: 'h-10',
          topOffset: 'top-3',
          showText: true
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

  const hasActualDates = task.start_date && task.due_date;
  const isOverdue = calculatedEndDate < new Date() && task.status !== 'completed';

  // Calculate actual width based on grid positioning
  const actualWidth = gridPosition.columnSpan * columnWidth;

  return (
    <div className={`relative ${getBarHeight()} flex-1 border-r border-slate-200`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute ${config.topOffset} ${config.height} rounded-md cursor-pointer transition-all duration-200 hover:opacity-80 hover:shadow-md ${
              isSelected ? 'ring-2 ring-orange-500 shadow-lg scale-105' : ''
            } ${isDragging ? 'opacity-50 z-10' : ''} ${
              isOverdue ? 'ring-1 ring-red-400' : ''
            } ${phaseColor} ${
              !hasActualDates ? 'border-2 border-dashed border-white border-opacity-50' : ''
            }`}
            style={{
              left: `${gridPosition.startColumnIndex * columnWidth}px`,
              width: `${gridPosition.columnSpan * columnWidth}px`,
              minWidth: config.minWidth
            }}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
          >
            {/* Task text */}
            <div className={`px-2 py-1 text-white ${config.fontSize} font-medium truncate`}>
              {actualWidth > 50 && config.showText ? getTaskDisplayText() : ''}
            </div>
            
            {/* Enhanced progress indicator */}
            {task.progress && task.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-md overflow-hidden">
                <div 
                  className="h-full bg-white bg-opacity-90 rounded-b-md transition-all duration-300 relative"
                  style={{ width: `${task.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-75"></div>
                </div>
              </div>
            )}

            {/* Overdue indicator */}
            {isOverdue && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}

            {/* Calculated dates indicator */}
            {!hasActualDates && (
              <div className="absolute top-0 left-0 w-2 h-2 bg-blue-400 rounded-br-md opacity-75"></div>
            )}

            {/* Priority indicator */}
            {task.priority === 'critical' && (
              <div className="absolute top-0 right-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-red-600 border-t-4 border-t-red-600"></div>
            )}

            {/* Touch-friendly selection indicator */}
            {isSelected && viewMode === 'days' && (
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-white border border-slate-200 shadow-lg">
          <div className="space-y-2 p-1">
            <div className="font-semibold text-slate-800">{task.title}</div>
            <div className="text-sm text-slate-600">
              <strong>Duration:</strong> {formatTooltipDate(calculatedStartDate)} - {formatTooltipDate(calculatedEndDate)}
              {!hasActualDates && <span className="text-blue-600"> (calculated)</span>}
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
            {task.category && (
              <div className="text-sm text-slate-600">
                <strong>Phase:</strong> {task.category}
              </div>
            )}
            {isOverdue && (
              <div className="text-sm text-red-600 font-medium">
                ⚠️ Overdue
              </div>
            )}
            <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
              View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Debug info - remove after verification */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-yellow-200 px-1 rounded">
          Col: {gridPosition.startColumnIndex} | Span: {gridPosition.columnSpan}
        </div>
      )}
    </div>
  );
};
