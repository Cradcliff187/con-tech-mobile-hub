
import React, { useState } from 'react';
import { Task } from '@/types/database';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';

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

  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const phaseColor = getConstructionPhaseColor(task);

  // Calculate position
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysFromStart = Math.ceil((calculatedStartDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((calculatedEndDate.getTime() - calculatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const leftPercent = Math.max(0, (daysFromStart / totalDays) * 100);
  const widthPercent = Math.min(100 - leftPercent, (taskDuration / totalDays) * 100);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    // Calculate new date based on drop position
    const dropPercent = relativeX / timelineWidth;
    const dropDays = dropPercent * totalDays;
    const newStartDate = new Date(timelineStart.getTime() + dropDays * 24 * 60 * 60 * 1000);
    
    // Calculate new end date maintaining duration
    const currentDuration = calculatedEndDate.getTime() - calculatedStartDate.getTime();
    const newEndDate = new Date(newStartDate.getTime() + currentDuration);

    // Update task
    onUpdate(task.id, {
      start_date: newStartDate.toISOString(),
      due_date: newEndDate.toISOString()
    });
  };

  return (
    <div 
      className="relative h-12 bg-slate-50"
      style={{ width: `${timelineUnits.length * columnWidth}px` }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Task Bar */}
      <div
        className={`absolute top-2 h-8 rounded transition-all cursor-grab active:cursor-grabbing ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        } ${isDragging ? 'opacity-50' : ''} ${phaseColor}`}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          minWidth: '24px'
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="px-2 py-1 h-full flex items-center">
          <span className="text-xs font-medium truncate">
            {task.title}
          </span>
        </div>
        
        {/* Progress indicator */}
        {task.progress && task.progress > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-75 rounded-b"
            style={{ width: `${task.progress}%` }}
          />
        )}
      </div>
    </div>
  );
};
