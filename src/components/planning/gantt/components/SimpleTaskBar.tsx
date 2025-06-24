import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '@/types/database';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';
import { toast } from '@/hooks/use-toast';

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; valid: boolean; date?: Date } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const validateDrop = useCallback((dropPercent: number, dropX: number): { valid: boolean; message: string; date?: Date } => {
    if (dropPercent < 0 || dropPercent > 100) {
      return { valid: false, message: 'Task cannot be moved outside timeline' };
    }
    
    // Calculate the new date more accurately
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.floor(dropPercent * totalDays / 100);
    const newStartDate = new Date(timelineStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
    
    // Snap to grid
    const columnIndex = Math.floor(dropX / columnWidth);
    const clampedIndex = Math.max(0, Math.min(columnIndex, timelineUnits.length - 1));
    const snappedDate = new Date(timelineUnits[clampedIndex].key);
    
    // Check constraints
    const currentDuration = calculatedEndDate.getTime() - calculatedStartDate.getTime();
    const newEndDate = new Date(snappedDate.getTime() + currentDuration);
    
    if (newEndDate > timelineEnd) {
      return { valid: false, message: 'Task would extend beyond project timeline' };
    }
    
    // Check for weekends (warning only)
    const dayOfWeek = snappedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { 
        valid: true, 
        message: 'Task will be scheduled on weekend',
        date: snappedDate
      };
    }
    
    return { 
      valid: true, 
      message: `Move to ${snappedDate.toLocaleDateString()}`,
      date: snappedDate
    };
  }, [timelineStart, timelineEnd, timelineUnits, columnWidth, calculatedStartDate, calculatedEndDate]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isUpdating) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create drag preview
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-blue-600 text-white px-3 py-2 rounded shadow-lg text-sm font-medium whitespace-nowrap';
    dragImage.textContent = task.title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [isUpdating, task.id, task.title]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragPreview(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const dropPercent = (relativeX / timelineWidth) * 100;
    
    const validation = validateDrop(dropPercent, relativeX);
    
    setDragPreview({
      x: relativeX,
      valid: validation.valid,
      date: validation.date
    });
    
    e.dataTransfer.dropEffect = validation.valid ? 'move' : 'none';
  }, [validateDrop]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragPreview(null);
    
    if (isUpdating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const dropPercent = (relativeX / timelineWidth) * 100;
    
    const validation = validateDrop(dropPercent, relativeX);
    if (!validation.valid || !validation.date) {
      toast({
        title: "Invalid Drop",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const newStartDate = validation.date;
      const currentDuration = calculatedEndDate.getTime() - calculatedStartDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + currentDuration);

      const updates: Partial<Task> = {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      };

      await onUpdate(task.id, updates);
      
      toast({
        title: "Task Updated",
        description: `"${task.title}" moved to ${newStartDate.toLocaleDateString()}`,
      });
      
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update task position",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, validateDrop, task.id, task.title, calculatedStartDate, calculatedEndDate, onUpdate]);

  // Use consistent heights: 32px for collapsed, 64px for expanded
  const containerHeight = isCollapsed ? '32px' : '64px';
  const barHeight = isCollapsed ? '16px' : '32px';
  const barTopOffset = isCollapsed ? '8px' : '16px';

  return (
    <div 
      className="relative bg-slate-50"
      style={{ 
        width: `${totalWidth}px`, 
        height: containerHeight 
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDragPreview(null)}
    >
      {/* Drag preview indicator */}
      {dragPreview && (
        <div
          className={`absolute top-0 bottom-0 w-0.5 z-20 ${
            dragPreview.valid ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ left: `${dragPreview.x}px` }}
        >
          {dragPreview.date && (
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs rounded whitespace-nowrap ${
              dragPreview.valid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {dragPreview.date.toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      
      {/* Task Bar */}
      <div
        className={`absolute rounded transition-all ${
          isUpdating ? 'cursor-wait opacity-50' : 'cursor-grab active:cursor-grabbing'
        } ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg' : 'hover:shadow-md'
        } ${
          isDragging ? 'opacity-75 scale-105 z-30 shadow-xl' : ''
        } ${phaseColor}`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: '24px',
          height: barHeight,
          top: barTopOffset
        }}
        draggable={!isUpdating}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="px-2 py-1 h-full flex items-center">
          <span className={`font-medium truncate text-white ${isCollapsed ? 'text-xs' : 'text-sm'}`}>
            {task.title}
          </span>
          {isUpdating && (
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
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded pointer-events-none" />
        )}
      </div>
    </div>
  );
};
