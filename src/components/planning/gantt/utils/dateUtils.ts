
import { Task } from '@/types/database';

export const calculateTaskDatesFromEstimate = (task: Task) => {
  let calculatedStartDate: Date;
  let calculatedEndDate: Date;

  if (task.start_date && task.due_date) {
    // Use actual dates if both are available
    calculatedStartDate = new Date(task.start_date);
    calculatedEndDate = new Date(task.due_date);
  } else if (task.start_date) {
    // Use start date and estimate duration
    calculatedStartDate = new Date(task.start_date);
    const estimatedDays = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1;
    calculatedEndDate = new Date(calculatedStartDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  } else if (task.due_date) {
    // Use due date and estimate duration backwards
    calculatedEndDate = new Date(task.due_date);
    const estimatedDays = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1;
    calculatedStartDate = new Date(calculatedEndDate.getTime() - estimatedDays * 24 * 60 * 60 * 1000);
  } else {
    // No dates available, use current date and estimate
    calculatedStartDate = new Date();
    const estimatedDays = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1;
    calculatedEndDate = new Date(calculatedStartDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  }

  return { calculatedStartDate, calculatedEndDate };
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};
