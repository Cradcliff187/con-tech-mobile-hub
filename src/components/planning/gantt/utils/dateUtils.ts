
import { Task } from '@/types/database';
import { addDays } from 'date-fns';

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
