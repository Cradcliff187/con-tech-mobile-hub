
import { Task } from '@/types/database';

export const getDaysBetween = (start: Date, end: Date) => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// **NEW: Calculate task start/end dates using estimated_hours**
export const calculateTaskDatesFromEstimate = (task: Task) => {
  let calculatedStartDate: Date;
  let calculatedEndDate: Date;

  if (task.start_date && task.due_date) {
    // Both dates available - use them directly
    calculatedStartDate = new Date(task.start_date);
    calculatedEndDate = new Date(task.due_date);
  } else if (task.due_date) {
    // Has due_date - calculate start_date using estimated_hours
    calculatedEndDate = new Date(task.due_date);
    
    if (task.estimated_hours && task.estimated_hours > 0) {
      // Convert hours to days (8-hour workday), minimum 1 day
      const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8));
      calculatedStartDate = new Date(calculatedEndDate);
      calculatedStartDate.setDate(calculatedStartDate.getDate() - estimatedDays);
    } else {
      // Fallback to category-based duration
      const estimatedDuration = getTaskDurationEstimate(task);
      calculatedStartDate = new Date(calculatedEndDate);
      calculatedStartDate.setDate(calculatedStartDate.getDate() - estimatedDuration);
    }
  } else if (task.start_date) {
    // Has start_date - calculate due_date using estimated_hours
    calculatedStartDate = new Date(task.start_date);
    
    if (task.estimated_hours && task.estimated_hours > 0) {
      const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8));
      calculatedEndDate = new Date(calculatedStartDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + estimatedDays);
    } else {
      const estimatedDuration = getTaskDurationEstimate(task);
      calculatedEndDate = new Date(calculatedStartDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + estimatedDuration);
    }
  } else {
    // No dates - use created_at as fallback
    calculatedStartDate = new Date(task.created_at);
    const estimatedDuration = task.estimated_hours 
      ? Math.max(1, Math.ceil(task.estimated_hours / 8))
      : getTaskDurationEstimate(task);
    calculatedEndDate = new Date(calculatedStartDate);
    calculatedEndDate.setDate(calculatedEndDate.getDate() + estimatedDuration);
  }

  return { calculatedStartDate, calculatedEndDate };
};

// **NEW: Get project timeline bounds**
export const getProjectTimelineBounds = (project: any) => {
  if (!project) return null;
  
  const start = project.start_date ? new Date(project.start_date) : null;
  const end = project.end_date ? new Date(project.end_date) : null;
  
  return { start, end };
};

// **HELPER: Get task duration estimate**
const getTaskDurationEstimate = (task: Task): number => {
  const CONSTRUCTION_PHASE_DURATIONS = {
    'foundation': 21,
    'framing': 30,
    'electrical': 14,
    'plumbing': 14,
    'hvac': 21,
    'finish': 28,
    'paint': 7,
    'default': 14
  };

  const category = task.category?.toLowerCase() || '';
  
  for (const [phase, duration] of Object.entries(CONSTRUCTION_PHASE_DURATIONS)) {
    if (category.includes(phase)) {
      return duration;
    }
  }
  
  return CONSTRUCTION_PHASE_DURATIONS.default;
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start';
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
  return `${start} - ${end}`;
};
