
import { Task } from '@/types/database';
import { getDaysBetween } from './dateUtils';

// New drag-and-drop utility functions
export const getDateFromPosition = (
  pixelX: number, 
  timelineWidth: number, 
  timelineStart: Date, 
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months' = 'weeks'
): Date => {
  const totalDays = getDaysBetween(timelineStart, timelineEnd);
  const dayPosition = (pixelX / timelineWidth) * totalDays;
  const newDate = new Date(timelineStart);
  newDate.setDate(newDate.getDate() + dayPosition);
  
  // Apply snapping based on view mode
  const snapInterval = getSnapInterval(viewMode);
  if (snapInterval > 0) {
    const daysSinceStart = getDaysBetween(timelineStart, newDate);
    const snappedDays = Math.round(daysSinceStart / snapInterval) * snapInterval;
    const snappedDate = new Date(timelineStart);
    snappedDate.setDate(snappedDate.getDate() + snappedDays);
    return snappedDate;
  }
  
  return newDate;
};

export const getSnapInterval = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': return 0.25; // 6-hour intervals
    case 'weeks': return 1; // Daily intervals
    case 'months': return 7; // Weekly intervals
    default: return 1;
  }
};

export const createDragPreview = (task: Task): HTMLElement => {
  const preview = document.createElement('div');
  preview.className = 'bg-blue-600 text-white px-3 py-2 rounded shadow-lg text-sm font-medium';
  preview.style.position = 'absolute';
  preview.style.top = '-1000px';
  preview.textContent = task.title;
  document.body.appendChild(preview);
  return preview;
};
