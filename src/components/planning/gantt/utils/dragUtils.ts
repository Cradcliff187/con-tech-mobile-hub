
import { Task } from '@/types/database';
import { generateTimelineUnits, getColumnWidth } from './gridUtils';
import { startOfDay, addDays } from 'date-fns';

// Simplified drag-and-drop utility functions using consolidated grid system
export const getDateFromPosition = (
  pixelX: number, 
  timelineWidth: number, 
  timelineStart: Date, 
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months' = 'weeks'
): Date => {
  // Use consolidated timeline generation
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);
  
  // Calculate which column the pixel position falls into
  const columnIndex = Math.floor(pixelX / columnWidth);
  
  // Clamp to valid range
  const clampedIndex = Math.max(0, Math.min(columnIndex, timelineUnits.length - 1));
  
  // Return the date for that column
  const targetDate = new Date(timelineUnits[clampedIndex].key);
  
  console.log('🎯 Date from position:', {
    pixelX,
    columnWidth,
    columnIndex,
    clampedIndex,
    targetDate: targetDate.toISOString(),
    viewMode
  });
  
  return targetDate;
};

export const getSnapInterval = (viewMode: 'days' | 'weeks' | 'months'): number => {
  // Simplified snapping - always snap to grid boundaries
  return 1;
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
