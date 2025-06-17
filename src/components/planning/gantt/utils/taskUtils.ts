
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate, getDaysBetween } from './dateUtils';

export const getTaskPosition = (task: Task, timelineStart: Date, timelineEnd: Date) => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const totalDays = getDaysBetween(timelineStart, timelineEnd);
  const daysFromStart = getDaysBetween(timelineStart, calculatedStartDate);
  const taskDuration = getDaysBetween(calculatedStartDate, calculatedEndDate);
  
  return {
    left: Math.max(0, (daysFromStart / totalDays) * 100),
    width: Math.min(100, (taskDuration / totalDays) * 100)
  };
};

export const getTaskDuration = (task: Task): number => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  return getDaysBetween(calculatedStartDate, calculatedEndDate);
};

export const getAssigneeName = (task: Task) => {
  if (task.assignee_id) return 'Team Member';
  if (task.assigned_stakeholder_id) return 'Stakeholder';
  return 'Unassigned';
};

export const getAssigneeInitials = (task: Task) => {
  if (task.assignee_id) return 'TM';
  if (task.assigned_stakeholder_id) return 'ST';
  return '?';
};
