
import React, { useState } from 'react';
import { Task } from '@/types/database';
import { 
  getTaskGridPosition,
  ROW_CONFIG,
  TimelineBounds
} from '../utils/coreGridSystem';
import { getConstructionPhaseColor } from '../utils/colorUtils';

interface UnifiedTaskBarProps {
  task: Task;
  timelineBounds: TimelineBounds;
  viewMode: 'days' | 'weeks' | 'months';
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const UnifiedTaskBar = ({
  task,
  timelineBounds,
  viewMode,
  isSelected,
  onSelect,
  onUpdate
}: UnifiedTaskBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const gridPosition = getTaskGridPosition(task, timelineBounds, viewMode);
  const phaseColor = getConstructionPhaseColor(task);

  const handleClick = () => {
    onSelect(task.id);
  };

  // Basic drag handling - will be enhanced in Phase 2
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onSelect(task.id);
  };

  return (
    <div
      className={`absolute rounded transition-all cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      } ${isDragging ? 'z-20 shadow-xl' : ''} ${
        isUpdating ? 'opacity-50' : ''
      } ${phaseColor}`}
      style={{
        left: `${gridPosition.pixelLeft}px`,
        width: `${gridPosition.pixelWidth}px`,
        height: `${ROW_CONFIG.taskBarHeight}px`,
        top: `${ROW_CONFIG.taskBarMargin}px`
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
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
