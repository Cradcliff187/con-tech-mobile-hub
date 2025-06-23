
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
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const gridPosition = getTaskGridPosition(task, timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
  const phaseColor = getConstructionPhaseColor(task);
  const config = getViewModeConfig(viewMode);
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  
  // Timeline boundary variables for off-timeline indicators
  const timelineRangeStart = new Date(timelineUnits[0].key);
  const timelineRangeEnd = new Date(timelineUnits[timelineUnits.length - 1].key);
  
  // Check if this specific task is being dragged
  const isThisTaskBeingDragged = isDragging && draggedTaskId === task.id;
  
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger selection during drag operations
    if (isDragging) return;
    onSelect(task.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('🎯 GanttTimelineBar: Starting drag for task:', task.id, task.title);
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const handleDragEnd = () => {
    console.log('🎯 GanttTimelineBar: Ending drag for task:', task.id);
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const hasActualDates = task.start_date && task.due_date;
  const isOverdue = calculatedEndDate < new Date() && task.status !== 'completed';
  const actualWidth = gridPosition.columnSpan * columnWidth;

  // Determine draggable state and cursor
  const canDrag = !!onDragStart && !isThisTaskBeingDragged;
  const cursorClass = isThisTaskBeingDragged 
    ? 'cursor-grabbing' 
    : canDrag 
      ? 'cursor-grab hover:cursor-grab' 
      : 'cursor-pointer';

  console.log('🎯 GanttTimelineBar: Render task bar', {
    taskId: task.id,
    title: task.title,
    isDragging,
    isThisTaskBeingDragged,
    canDrag,
    hasHandlers: { onDragStart: !!onDragStart, onDragEnd: !!onDragEnd }
  });

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
          className={`absolute ${config.topOffset} ${config.height} rounded-md transition-all duration-200 ${
            isSelected ? 'ring-2 ring-orange-500 shadow-lg scale-105' : ''
          } ${
            isThisTaskBeingDragged 
              ? 'opacity-75 z-20 scale-105 shadow-2xl ring-2 ring-blue-500 animate-pulse' 
              : 'hover:opacity-90 hover:shadow-md'
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
            task={task} 
            actualWidth={actualWidth} 
            viewModeConfig={config} 
          />
          
          <TaskBarIndicators 
            task={task} 
            isSelected={isSelected} 
            viewMode={viewMode} 
          />

          {/* Enhanced visual drag feedback */}
          {isThisTaskBeingDragged && (
            <>
              <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-md pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-medium bg-blue-600 px-2 py-1 rounded">
                Moving...
              </div>
            </>
          )}
        </div>
      </TaskBarTooltip>

      {/* Debug overlay - development only */}
      {process.env.NODE_ENV === 'development' && (
        <>
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
          
          <div className="absolute -top-6 left-0 text-xs bg-yellow-200 px-1 rounded">
            Draggable: {canDrag.toString()} | Dragging: {isThisTaskBeingDragged.toString()}
          </div>
        </>
      )}
    </div>
  );
};
