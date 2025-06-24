
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
import { useGanttContext } from '@/contexts/gantt';

interface GanttTimelineBarProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging?: boolean;
  draggedTaskId?: string;
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
  draggedTaskId = null,
  onDragStart,
  onDragEnd
}: GanttTimelineBarProps) => {
  const { getDisplayTask } = useGanttContext();
  
  const displayTask = getDisplayTask ? getDisplayTask(task.id) || task : task;
  
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(displayTask);
  const gridPosition = getTaskGridPosition(displayTask, timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
  const phaseColor = getConstructionPhaseColor(displayTask);
  const config = getViewModeConfig(viewMode);
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  const timelineRangeStart = new Date(timelineUnits[0].key);
  const timelineRangeEnd = new Date(timelineUnits[timelineUnits.length - 1].key);
  
  const isThisTaskBeingDragged = isDragging && draggedTaskId === displayTask.id;
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    onSelect(displayTask.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, displayTask);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const hasActualDates = displayTask.start_date && displayTask.due_date;
  const isOverdue = calculatedEndDate < new Date() && displayTask.status !== 'completed';
  const actualWidth = gridPosition.columnSpan * columnWidth;

  const canDrag = !!onDragStart && !isThisTaskBeingDragged;
  const cursorClass = isThisTaskBeingDragged 
    ? 'cursor-grabbing' 
    : canDrag 
      ? 'cursor-grab hover:cursor-grab' 
      : 'cursor-pointer';

  return (
    <div className={`relative ${getBarHeight(viewMode)}`} style={{ width: `${timelineUnits.length * columnWidth}px` }}>
      {/* Off-timeline indicators */}
      {gridPosition.startColumnIndex === 0 && calculatedStartDate < timelineRangeStart && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-l flex items-center gap-1 shadow-sm">
            <ChevronLeft size={12} />
            {format(calculatedStartDate, 'MMM d, yyyy')}
          </div>
        </div>
      )}

      {gridPosition.startColumnIndex + gridPosition.columnSpan >= timelineUnits.length - 1 && 
       calculatedEndDate > timelineRangeEnd && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-r flex items-center gap-1 shadow-sm">
            {format(calculatedEndDate, 'MMM d, yyyy')}
            <ChevronRight size={12} />
          </div>
        </div>
      )}

      <TaskBarTooltip task={displayTask} viewMode={viewMode}>
        <div
          className={`absolute ${config.topOffset} ${config.height} rounded-md transition-all duration-300 ${
            isSelected 
              ? 'ring-2 ring-orange-500 ring-offset-1 shadow-lg scale-105 z-10' 
              : 'hover:shadow-md hover:scale-[1.02]'
          } ${
            isThisTaskBeingDragged 
              ? 'opacity-75 z-20 scale-105 shadow-xl ring-2 ring-blue-500 animate-pulse' 
              : ''
          } ${cursorClass} ${
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
          draggable={canDrag}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TaskBarContent 
            task={displayTask} 
            actualWidth={actualWidth} 
            viewModeConfig={config} 
          />
          
          <TaskBarIndicators 
            task={displayTask} 
            isSelected={isSelected} 
            viewMode={viewMode} 
          />

          {isThisTaskBeingDragged && (
            <>
              <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-md pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-medium bg-blue-600 px-2 py-1 rounded shadow-sm">
                Moving...
              </div>
            </>
          )}
        </div>
      </TaskBarTooltip>
    </div>
  );
};
