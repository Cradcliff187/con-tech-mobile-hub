
import { Task } from '@/types/database';
import { getDaysBetween } from './dateUtils';

export interface DragValidationResult {
  isValid: boolean;
  validity: 'valid' | 'warning' | 'invalid';
  messages: string[];
}

export const validateTaskDrag = (
  task: Task,
  newStartDate: Date,
  timelineStart: Date,
  timelineEnd: Date,
  allTasks: Task[] = []
): DragValidationResult => {
  const messages: string[] = [];
  let validity: 'valid' | 'warning' | 'invalid' = 'valid';

  // Check if date is within timeline bounds
  if (newStartDate < timelineStart || newStartDate > timelineEnd) {
    messages.push('Task cannot be moved outside the project timeline');
    validity = 'invalid';
  }

  // Check for weekend placement (warning only)
  const dayOfWeek = newStartDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    messages.push('Task scheduled on weekend');
    if (validity === 'valid') validity = 'warning';
  }

  // Calculate new end date based on original duration
  const currentStart = task.start_date ? new Date(task.start_date) : new Date();
  const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const newEndDate = new Date(newStartDate.getTime() + durationMs);

  // Check if new end date exceeds timeline
  if (newEndDate > timelineEnd) {
    messages.push('Task duration would extend beyond project timeline');
    validity = 'invalid';
  }

  // Check for task overlaps with same assignee (warning only)
  if (task.assigned_stakeholder_id) {
    const overlappingTasks = allTasks.filter(t => 
      t.id !== task.id && 
      t.assigned_stakeholder_id === task.assigned_stakeholder_id &&
      t.start_date && t.due_date
    );

    for (const otherTask of overlappingTasks) {
      const otherStart = new Date(otherTask.start_date!);
      const otherEnd = new Date(otherTask.due_date!);
      
      if ((newStartDate >= otherStart && newStartDate <= otherEnd) ||
          (newEndDate >= otherStart && newEndDate <= otherEnd) ||
          (newStartDate <= otherStart && newEndDate >= otherEnd)) {
        messages.push(`Would overlap with "${otherTask.title}"`);
        if (validity === 'valid') validity = 'warning';
        break;
      }
    }
  }

  // Check for critical path dependencies (warning only)
  if (task.priority === 'critical' && validity === 'valid') {
    const isMovingEarlier = newStartDate < currentStart;
    if (isMovingEarlier) {
      messages.push('Moving critical task earlier may affect project timeline');
      validity = 'warning';
    }
  }

  // Provide helpful success message
  if (validity === 'valid' && messages.length === 0) {
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    messages.push(`Move task to ${newStartDate.toLocaleDateString()} (${durationDays} day${durationDays !== 1 ? 's' : ''})`);
  }

  return {
    isValid: validity !== 'invalid',
    validity,
    messages
  };
};

export const getSnapDate = (
  date: Date,
  viewMode: 'days' | 'weeks' | 'months'
): Date => {
  const snappedDate = new Date(date);
  
  switch (viewMode) {
    case 'days':
      // Snap to nearest 6-hour interval
      const hours = snappedDate.getHours();
      const snappedHours = Math.round(hours / 6) * 6;
      snappedDate.setHours(snappedHours, 0, 0, 0);
      break;
      
    case 'weeks':
      // Snap to nearest day
      snappedDate.setHours(0, 0, 0, 0);
      break;
      
    case 'months':
      // Snap to nearest week (Monday)
      const dayOfWeek = snappedDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      snappedDate.setDate(snappedDate.getDate() + daysToMonday);
      snappedDate.setHours(0, 0, 0, 0);
      break;
  }
  
  return snappedDate;
};
