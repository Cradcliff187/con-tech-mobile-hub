import React, { memo, useMemo } from 'react';
import { Task } from '@/types/database';

interface TaskDurationBadgeProps {
  task: Task;
  barWidth: number;
  position?: 'right' | 'center';
}

const formatDuration = (hours: number): string => {
  if (hours < 8) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;
  
  if (remainingHours === 0) {
    return `${days}d`;
  }
  
  return `${days}d ${remainingHours}h`;
};

const TaskDurationBadgeComponent = ({ 
  task, 
  barWidth, 
  position = 'right' 
}: TaskDurationBadgeProps) => {
  const durationText = useMemo(() => {
    if (!task.estimated_hours || task.estimated_hours <= 0) {
      return null;
    }
    return formatDuration(task.estimated_hours);
  }, [task.estimated_hours]);

  // Hide badge if bar is too narrow or no duration
  if (barWidth < 60 || !durationText) {
    return null;
  }

  const positionClasses = position === 'right' 
    ? 'absolute right-1 top-1/2 -translate-y-1/2' 
    : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

  return (
    <div 
      className={`${positionClasses} bg-background/90 text-foreground text-xs px-1.5 py-0.5 rounded shadow-sm font-medium pointer-events-none z-10`}
      aria-hidden="true"
    >
      {durationText}
    </div>
  );
};

export const TaskDurationBadge = memo(TaskDurationBadgeComponent, (prevProps, nextProps) => {
  return (
    prevProps.task.estimated_hours === nextProps.task.estimated_hours &&
    prevProps.barWidth === nextProps.barWidth &&
    prevProps.position === nextProps.position
  );
});