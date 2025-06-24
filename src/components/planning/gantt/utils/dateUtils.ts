
import { Task } from '@/types/database';
import { addDays, differenceInDays, format } from 'date-fns';

export interface TaskDateCalculation {
  calculatedStartDate: Date;
  calculatedEndDate: Date;
}

export const calculateTaskDatesFromEstimate = (task: Task): TaskDateCalculation => {
  let calculatedStartDate: Date;
  let calculatedEndDate: Date;

  if (task.start_date && task.due_date) {
    // Use actual dates if available
    calculatedStartDate = new Date(task.start_date);
    calculatedEndDate = new Date(task.due_date);
  } else if (task.start_date && task.estimated_hours) {
    // Calculate end date from start date and estimated hours
    calculatedStartDate = new Date(task.start_date);
    const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8)); // 8 hours per day
    calculatedEndDate = addDays(calculatedStartDate, estimatedDays);
  } else if (task.due_date && task.estimated_hours) {
    // Calculate start date from due date and estimated hours
    calculatedEndDate = new Date(task.due_date);
    const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8)); // 8 hours per day
    calculatedStartDate = addDays(calculatedEndDate, -estimatedDays);
  } else {
    // Fallback to today and tomorrow if no dates available
    calculatedStartDate = new Date();
    calculatedEndDate = addDays(calculatedStartDate, 1);
  }

  return {
    calculatedStartDate,
    calculatedEndDate
  };
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  return Math.max(1, differenceInDays(endDate, startDate));
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = format(startDate, 'MMM d');
  const end = format(endDate, 'MMM d');
  
  // If same year, don't repeat it
  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth() && startDate.getDate() === endDate.getDate()) {
      // Same day
      return `${start}, ${startDate.getFullYear()}`;
    }
    // Different days, same year
    return `${start} - ${end}, ${startDate.getFullYear()}`;
  }
  
  // Different years
  return `${start}, ${startDate.getFullYear()} - ${end}, ${endDate.getFullYear()}`;
};
