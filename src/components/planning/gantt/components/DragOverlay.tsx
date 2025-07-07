import React, { useMemo } from 'react';
import { useGanttContext } from '@/contexts/gantt/useGanttContext';
import { generateTimelineUnits, getColumnIndexForDate, getColumnWidth } from '../utils/gridUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';

interface DragOverlayProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const DragOverlay = React.memo(({
  timelineStart,
  timelineEnd,
  viewMode
}: DragOverlayProps) => {
  const { state } = useGanttContext();
  const { dragState } = state;

  // Generate timeline units for position calculation
  const timelineUnits = useMemo(() => 
    generateTimelineUnits(timelineStart, timelineEnd, viewMode),
    [timelineStart, timelineEnd, viewMode]
  );

  const columnWidth = getColumnWidth(viewMode);

  // Calculate drop indicator position
  const dropIndicatorPosition = useMemo(() => {
    if (!dragState.dropPreviewDate || !timelineUnits.length) return null;

    const columnIndex = getColumnIndexForDate(dragState.dropPreviewDate, timelineUnits, viewMode);
    const leftPosition = columnIndex * columnWidth;
    
    return leftPosition;
  }, [dragState.dropPreviewDate, timelineUnits, viewMode, columnWidth]);

  // Calculate ghost task position and dimensions
  const ghostTaskPosition = useMemo(() => {
    if (!dragState.draggedTask || !dragState.dropPreviewDate || !timelineUnits.length) return null;

    const task = dragState.draggedTask;
    const columnIndex = getColumnIndexForDate(dragState.dropPreviewDate, timelineUnits, viewMode);
    
    // Calculate task duration in days
    const taskStart = task.start_date ? new Date(task.start_date) : new Date();
    const taskEnd = task.due_date ? new Date(task.due_date) : new Date();
    const durationMs = taskEnd.getTime() - taskStart.getTime();
    const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
    
    // Calculate width based on duration and view mode
    let taskWidthColumns = 1;
    switch (viewMode) {
      case 'days':
        taskWidthColumns = durationDays;
        break;
      case 'weeks':
        taskWidthColumns = Math.max(1, Math.ceil(durationDays / 7));
        break;
      case 'months':
        taskWidthColumns = Math.max(1, Math.ceil(durationDays / 30));
        break;
    }

    const leftPosition = columnIndex * columnWidth;
    const width = taskWidthColumns * columnWidth;

    return {
      left: leftPosition,
      width: Math.max(width, 60), // Minimum width for readability
      task
    };
  }, [dragState.draggedTask, dragState.dropPreviewDate, timelineUnits, viewMode, columnWidth]);

  // Get validation styles
  const getValidityStyles = (validity: 'valid' | 'warning' | 'invalid') => {
    switch (validity) {
      case 'valid':
        return 'border-green-500 bg-green-100 text-green-800';
      case 'warning':
        return 'border-yellow-500 bg-yellow-100 text-yellow-800';
      case 'invalid':
        return 'border-red-500 bg-red-100 text-red-800';
      default:
        return 'border-green-500 bg-green-100 text-green-800';
    }
  };

  const getIndicatorColor = (validity: 'valid' | 'warning' | 'invalid') => {
    switch (validity) {
      case 'valid':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'invalid':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  // Don't render if not dragging
  if (!dragState.isDragging) return null;

  const taskListWidth = 'w-64 lg:w-72'; // Match the task list width
  const taskListPixelWidth = 256; // Default width, will be 288 on lg screens

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Drop indicator line */}
      {dropIndicatorPosition !== null && (
        <div 
          className={`absolute top-0 bottom-0 w-0.5 transition-all duration-200 ${getIndicatorColor(dragState.currentValidity)}`}
          style={{ 
            left: `${taskListPixelWidth + dropIndicatorPosition}px`,
            marginTop: '64px' // Account for header height
          }}
        >
          {/* Date tooltip */}
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 text-xs rounded whitespace-nowrap z-60 ${getValidityStyles(dragState.currentValidity)}`}>
            {dragState.dropPreviewDate?.toLocaleDateString()}
            {dragState.violationMessages.length > 0 && (
              <div className="mt-1 text-xs opacity-90">
                {dragState.violationMessages[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ghost task */}
      {ghostTaskPosition && (
        <div
          className="absolute transition-all duration-200"
          style={{
            left: `${taskListPixelWidth + ghostTaskPosition.left}px`,
            width: `${ghostTaskPosition.width}px`,
            top: '96px', // Account for header + timeline header
            height: '32px'
          }}
        >
          <div className={`h-full rounded opacity-75 border-2 transition-all duration-200 ${
            getConstructionPhaseColor(ghostTaskPosition.task)
          } ${
            dragState.currentValidity === 'valid' ? 'border-green-400' :
            dragState.currentValidity === 'warning' ? 'border-yellow-400' :
            'border-red-400'
          }`}>
            <div className="px-2 py-1 h-full flex items-center">
              <span className="font-medium truncate text-white text-sm">
                {ghostTaskPosition.task.title}
              </span>
            </div>
            
            {/* Progress indicator */}
            {ghostTaskPosition.task.progress && ghostTaskPosition.task.progress > 0 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
                style={{ width: `${Math.min(100, ghostTaskPosition.task.progress)}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Violation messages overlay */}
      {dragState.violationMessages.length > 0 && dragState.currentValidity === 'invalid' && (
        <div className="absolute top-4 right-4 max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex">
              <div className="text-sm">
                <strong className="font-bold">Cannot drop here:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {dragState.violationMessages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DragOverlay.displayName = 'DragOverlay';