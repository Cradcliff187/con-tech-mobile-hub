
import React, { useState } from 'react';
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
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export const SimpleTaskBar = ({
  task,
  timelineStart,
  timelineEnd,
  viewMode,
  isSelected,
  onUpdate
}: SimpleTaskBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; valid: boolean } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const phaseColor = getConstructionPhaseColor(task);

  // Calculate position using consistent grid system
  const totalWidth = timelineUnits.length * columnWidth;
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysFromStart = Math.ceil((calculatedStartDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((calculatedEndDate.getTime() - calculatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const leftPercent = Math.max(0, (daysFromStart / totalDays) * 100);
  const widthPercent = Math.min(100 - leftPercent, (taskDuration / totalDays) * 100);

  const validateDrop = (dropPercent: number): { valid: boolean; message: string } => {
    if (dropPercent < 0 || dropPercent > 100) {
      return { valid: false, message: 'Task cannot be moved outside timeline' };
    }
    
    const dropDays = dropPercent * totalDays;
    const newStartDate = new Date(timelineStart.getTime() + dropDays * 24 * 60 * 60 * 1000);
    
    // Check if it's a weekend
    const dayOfWeek = newStartDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { valid: true, message: 'Task will be scheduled on weekend' };
    }
    
    return { valid: true, message: 'Valid drop position' };
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isUpdating) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create drag preview
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-blue-600 text-white px-3 py-2 rounded shadow-lg text-sm font-medium';
    dragImage.textContent = task.title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const dropPercent = (relativeX / timelineWidth) * 100;
    
    const validation = validateDrop(dropPercent);
    
    setDragPreview({
      x: relativeX,
      valid: validation.valid
    });
    
    e.dataTransfer.dropEffect = validation.valid ? 'move' : 'none';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragPreview(null);
    
    if (isUpdating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const dropPercent = (relativeX / timelineWidth) * 100;
    
    const validation = validateDrop(dropPercent);
    if (!validation.valid) {
      toast({
        title: "Invalid Drop",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Calculate new date based on drop position
      const dropDays = dropPercent * totalDays;
      const newStartDate = new Date(timelineStart.getTime() + dropDays * 24 * 60 * 60 * 1000);
      
      // Calculate new end date maintaining duration
      const currentDuration = calculatedEndDate.getTime() - calculatedStartDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + currentDuration);

      // Update task
      await onUpdate(task.id, {
        start_date: newStartDate.toISOString(),
        due_date: newEndDate.toISOString()
      });
      
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
  };

  return (
    <div 
      className="relative h-12 bg-slate-50"
      style={{ width: `${totalWidth}px` }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDragPreview(null)}
    >
      {/* Drag preview indicator */}
      {dragPreview && (
        <div
          className={`absolute top-0 bottom-0 w-0.5 z-10 ${
            dragPreview.valid ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ left: `${dragPreview.x}px` }}
        />
      )}
      
      {/* Task Bar */}
      <div
        className={`absolute top-2 h-8 rounded transition-all ${
          isUpdating ? 'cursor-wait opacity-50' : 'cursor-grab active:cursor-grabbing'
        } ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        } ${
          isDragging ? 'opacity-75 scale-105 z-20' : ''
        } ${phaseColor}`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: '24px'
        }}
        draggable={!isUpdating}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="px-2 py-1 h-full flex items-center">
          <span className="text-xs font-medium truncate">
            {task.title}
          </span>
          {isUpdating && (
            <div className="ml-2 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        {/* Progress indicator */}
        {task.progress && task.progress > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
            style={{ width: `${task.progress}%` }}
          />
        )}
        
        {/* Dragging overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded pointer-events-none" />
        )}
      </div>
    </div>
  );
};
