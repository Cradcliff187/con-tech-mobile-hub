
import React, { useState } from 'react';
import { Task } from '@/types/database';
import { 
  getTaskPixelPosition, 
  getTaskPixelWidth, 
  getDateFromPixelPosition,
  getTaskDates,
  ROW_HEIGHT,
  TASK_BAR_HEIGHT,
  TASK_BAR_MARGIN
} from '../utils/unifiedGridUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';

interface UnifiedTaskBarProps {
  task: Task;
  timelineStart: Date;
  dayWidth: number;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const UnifiedTaskBar = ({
  task,
  timelineStart,
  dayWidth,
  isSelected,
  onSelect,
  onUpdate
}: UnifiedTaskBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const { startDate, endDate } = getTaskDates(task);
  const phaseColor = getConstructionPhaseColor(task);
  
  const left = getTaskPixelPosition(startDate, timelineStart, dayWidth);
  const width = getTaskPixelWidth(startDate, endDate, dayWidth);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    onSelect(task.id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const taskBar = document.getElementById(`task-bar-${task.id}`);
    if (taskBar) {
      taskBar.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const handleMouseUp = async (e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsUpdating(true);
    
    try {
      const deltaX = e.clientX - dragStartX;
      const daysMoved = Math.round(deltaX / dayWidth);
      
      if (daysMoved !== 0) {
        const newStartDate = new Date(startDate.getTime() + daysMoved * 24 * 60 * 60 * 1000);
        const newEndDate = new Date(endDate.getTime() + daysMoved * 24 * 60 * 60 * 1000);
        
        await onUpdate(task.id, {
          start_date: newStartDate.toISOString(),
          due_date: newEndDate.toISOString()
        });
      }
      
      // Reset transform
      const taskBar = document.getElementById(`task-bar-${task.id}`);
      if (taskBar) {
        taskBar.style.transform = '';
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      // Reset transform on error
      const taskBar = document.getElementById(`task-bar-${task.id}`);
      if (taskBar) {
        taskBar.style.transform = '';
      }
    } finally {
      setIsUpdating(false);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStartX]);

  return (
    <div
      id={`task-bar-${task.id}`}
      className={`absolute rounded transition-all cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      } ${isDragging ? 'z-20 shadow-xl' : ''} ${
        isUpdating ? 'opacity-50' : ''
      } ${phaseColor}`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: `${TASK_BAR_HEIGHT}px`,
        top: `${TASK_BAR_MARGIN}px`
      }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(task.id)}
    >
      <div className="px-2 py-1 h-full flex items-center">
        <span className="text-white text-sm font-medium truncate">
          {task.title}
        </span>
        {isUpdating && (
          <div className="ml-2 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>
      
      {task.progress && task.progress > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
          style={{ width: `${Math.min(100, task.progress)}%` }}
        />
      )}
    </div>
  );
};
