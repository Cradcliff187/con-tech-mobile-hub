
import { Task } from '@/types/database';
import { getTaskGridPosition, getColumnWidth } from './utils/gridUtils';
import { calculateTaskDatesFromEstimate } from './utils/dateUtils';
import { getConstructionPhaseColor } from './utils/colorUtils';
import { TaskBarTooltip } from './components/TaskBarTooltip';
import { TaskBarIndicators } from './components/TaskBarIndicators';
import { TaskBarContent } from './components/TaskBarContent';
import { getViewModeConfig, getBarHeight } from './utils/viewModeUtils';
import { generateTimelineUnits } from './utils/gridUtils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const config = getViewModeConfig(viewMode);
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  // Timeline boundary variables for off-timeline indicators
  const timelineRangeStart = new Date(timelineUnits[0].key);
  const timelineRangeEnd = new Date(timelineUnits[timelineUnits.length - 1].key);
  
  const handleClick = () => {
    onSelect(task.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const hasActualDates = task.start_date && task.due_date;
  const isOverdue = calculatedEndDate < new Date() && task.status !== 'completed';
  const actualWidth = gridPosition.columnSpan * columnWidth;

  return (
    <div className={`relative ${getBarHeight(viewMode)}`} style={{ width: `${timelineUnits.length * columnWidth}px` }}>
      {/* Off-timeline indicator for past tasks */}
      {gridPosition.startColumnIndex === 0 && calculatedStartDate < timelineRangeStart && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-l flex items-center gap-1">
            <ChevronLeft size={12} />
            {format(calculatedStartDate, 'MMM d, yyyy')}
          </div>
        </div>
      )}

      {/* Off-timeline indicator for future tasks */}
      {gridPosition.startColumnIndex + gridPosition.columnSpan >= timelineUnits.length - 1 && 
       calculatedEndDate > timelineRangeEnd && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-r flex items-center gap-1">
            {format(calculatedEndDate, 'MMM d, yyyy')}
            <ChevronRight size={12} />
          </div>
        </div>
      )}

      <TaskBarTooltip task={task} viewMode={viewMode}>
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
          <TaskBarContent 
            task={task} 
            actualWidth={actualWidth} 
            viewModeConfig={config} 
          />
          
          <TaskBarIndicators 
            task={task} 
            isSelected={isSelected} 
            viewMode={viewMode} 
          />
        </div>
      </TaskBarTooltip>

      {/* Debug overlay - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute top-0 h-full border-2 border-red-500 bg-red-100 opacity-30 pointer-events-none"
          style={{
            left: `${gridPosition.startColumnIndex * columnWidth}px`,
            width: `${gridPosition.columnSpan * columnWidth}px`,
          }}
        >
          <div className="text-xs bg-white p-1 rounded shadow-sm">
            {format(calculatedStartDate, 'MMM d')} | Col: {gridPosition.startColumnIndex}
          </div>
        </div>
      )}

      {/* Debug info - remove after verification */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-yellow-200 px-1 rounded">
          Col: {gridPosition.startColumnIndex} | Span: {gridPosition.columnSpan}
        </div>
      )}
    </div>
  );
};
