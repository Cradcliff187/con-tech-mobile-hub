import React, { useMemo } from 'react';
import { Task } from '@/types/database';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';
import { useGanttContext } from '@/contexts/gantt/useGanttContext';
import { useGanttDragBridge } from '@/hooks/useGanttDragBridge';

interface SimpleTaskBarProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  isSelected: boolean;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  isCollapsed?: boolean;
}

export const SimpleTaskBar = ({
  task,
  timelineStart,
  timelineEnd,
  viewMode,
  isSelected,
  onUpdate,
  isCollapsed = false
}: SimpleTaskBarProps) => {
  // Use centralized context for drag state
  const { state } = useGanttContext();
  const { dragState, saving } = state;

  // Use the drag bridge hook for all drag operations
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useGanttDragBridge({
    timelineStart,
    timelineEnd,
    viewMode
  });

  const timelineUnits = useMemo(() => 
    generateTimelineUnits(timelineStart, timelineEnd, viewMode),
    [timelineStart, timelineEnd, viewMode]
  );
  
  const columnWidth = getColumnWidth(viewMode);
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const phaseColor = getConstructionPhaseColor(task);

  // Calculate position using consistent grid system
  const { leftPercent, widthPercent, totalWidth } = useMemo(() => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((calculatedStartDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((calculatedEndDate.getTime() - calculatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const leftPercent = Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
    const widthPercent = Math.max(1, Math.min(100 - leftPercent, (taskDuration / totalDays) * 100));
    const totalWidth = timelineUnits.length * columnWidth;

    return { leftPercent, widthPercent, totalWidth };
  }, [calculatedStartDate, calculatedEndDate, timelineStart, timelineEnd, timelineUnits.length, columnWidth]);

  // Check if this task is currently being dragged
  const isThisTaskDragging = dragState.isDragging && dragState.draggedTask?.id === task.id;
  
  // Calculate drag preview position if this timeline is receiving a drag
  const dragPreviewPosition = useMemo(() => {
    if (!dragState.isDragging || !dragState.dropPreviewDate) return null;
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((dragState.dropPreviewDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const leftPercent = Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
    
    return leftPercent;
  }, [dragState.isDragging, dragState.dropPreviewDate, timelineStart, timelineEnd]);

  // Use consistent heights: 32px for collapsed, 64px for expanded
  const containerHeight = isCollapsed ? '32px' : '64px';
  const barHeight = isCollapsed ? '16px' : '32px';
  const barTopOffset = isCollapsed ? '8px' : '16px';

  // Get validity color for drag preview
  const getValidityColor = (validity: 'valid' | 'warning' | 'invalid') => {
    switch (validity) {
      case 'valid': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'invalid': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div 
      className="relative bg-slate-50"
      style={{ 
        width: `${totalWidth}px`, 
        height: containerHeight 
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag preview indicator from context */}
      {dragState.isDragging && dragPreviewPosition !== null && (
        <div
          className={`absolute top-0 bottom-0 w-0.5 z-20 ${getValidityColor(dragState.currentValidity)}`}
          style={{ left: `${dragPreviewPosition}%` }}
        >
          {dragState.dropPreviewDate && (
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs rounded whitespace-nowrap ${
              dragState.currentValidity === 'valid' ? 'bg-green-500 text-white' : 
              dragState.currentValidity === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {dragState.violationMessages[0] || dragState.dropPreviewDate.toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      
      {/* Task Bar */}
      <div
        className={`absolute rounded transition-all ${
          saving ? 'cursor-wait opacity-50' : 'cursor-grab active:cursor-grabbing'
        } ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg' : 'hover:shadow-md'
        } ${
          isThisTaskDragging ? 'opacity-75 scale-105 z-30 shadow-xl' : ''
        } ${phaseColor}`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: '24px',
          height: barHeight,
          top: barTopOffset
        }}
        draggable={!saving}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
      >
        <div className="px-2 py-1 h-full flex items-center">
          <span className={`font-medium truncate text-white ${isCollapsed ? 'text-xs' : 'text-sm'}`}>
            {task.title}
          </span>
          {saving && (
            <div className="ml-2 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
        </div>
        
        {/* Progress indicator */}
        {task.progress && task.progress > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
            style={{ width: `${Math.min(100, task.progress)}%` }}
          />
        )}
        
        {/* Status indicator */}
        {task.status === 'completed' && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full transform translate-x-1/2 -translate-y-1/2" />
        )}
        
        {/* Dragging overlay */}
        {isThisTaskDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded pointer-events-none" />
        )}
      </div>
    </div>
  );
};