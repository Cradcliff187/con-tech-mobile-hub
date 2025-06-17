
import { Task } from '@/types/database';

export const getDaysBetween = (start: Date, end: Date) => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// **ENHANCED: Calculate task start/end dates using estimated_hours with business day support**
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
      // Convert hours to business days (8-hour workday), minimum 1 day
      const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8));
      calculatedStartDate = subtractBusinessDays(calculatedEndDate, estimatedDays);
    } else {
      // Fallback to category-based duration
      const estimatedDuration = getTaskDurationEstimate(task);
      calculatedStartDate = subtractBusinessDays(calculatedEndDate, estimatedDuration);
    }
  } else if (task.start_date) {
    // Has start_date - calculate due_date using estimated_hours
    calculatedStartDate = new Date(task.start_date);
    
    if (task.estimated_hours && task.estimated_hours > 0) {
      const estimatedDays = Math.max(1, Math.ceil(task.estimated_hours / 8));
      calculatedEndDate = addBusinessDays(calculatedStartDate, estimatedDays);
    } else {
      const estimatedDuration = getTaskDurationEstimate(task);
      calculatedEndDate = addBusinessDays(calculatedStartDate, estimatedDuration);
    }
  } else {
    // No dates - use created_at as fallback
    calculatedStartDate = new Date(task.created_at);
    const estimatedDuration = task.estimated_hours 
      ? Math.max(1, Math.ceil(task.estimated_hours / 8))
      : getTaskDurationEstimate(task);
    calculatedEndDate = addBusinessDays(calculatedStartDate, estimatedDuration);
  }

  return { calculatedStartDate, calculatedEndDate };
};

// **NEW: Business day calculations**
const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
};

const subtractBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let subtractedDays = 0;
  
  while (subtractedDays < days) {
    result.setDate(result.getDate() - 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      subtractedDays++;
    }
  }
  
  return result;
};

// **NEW: Get project timeline bounds**
export const getProjectTimelineBounds = (project: any) => {
  if (!project) return null;
  
  const start = project.start_date ? new Date(project.start_date) : null;
  const end = project.end_date ? new Date(project.end_date) : null;
  
  return { start, end };
};

// **ENHANCED: Construction-specific duration estimates**
const getTaskDurationEstimate = (task: Task): number => {
  const CONSTRUCTION_PHASE_DURATIONS = {
    'foundation': 21,        // 3 weeks
    'framing': 30,          // 4+ weeks  
    'electrical': 14,       // 2 weeks
    'plumbing': 14,         // 2 weeks
    'hvac': 21,            // 3 weeks
    'finish': 28,          // 4 weeks
    'paint': 7,            // 1 week
    'roofing': 10,         // 1.5 weeks
    'flooring': 14,        // 2 weeks
    'drywall': 21,         // 3 weeks
    'insulation': 7,       // 1 week
    'siding': 14,          // 2 weeks
    'windows': 10,         // 1.5 weeks
    'doors': 5,            // 1 week
    'inspection': 2,       // 2 days
    'punch_list': 5,       // 1 week
    'default': 14          // 2 weeks
  };

  const category = task.category?.toLowerCase() || '';
  const taskType = task.task_type || 'regular';
  
  // Special handling for punch list items
  if (taskType === 'punch_list') {
    return CONSTRUCTION_PHASE_DURATIONS.punch_list;
  }
  
  // Check for category matches
  for (const [phase, duration] of Object.entries(CONSTRUCTION_PHASE_DURATIONS)) {
    if (category.includes(phase)) {
      return duration;
    }
  }
  
  // Priority-based adjustments
  if (task.priority === 'critical') {
    return Math.ceil(CONSTRUCTION_PHASE_DURATIONS.default * 0.75); // Faster execution
  } else if (task.priority === 'low') {
    return Math.ceil(CONSTRUCTION_PHASE_DURATIONS.default * 1.25); // More time allowed
  }
  
  return CONSTRUCTION_PHASE_DURATIONS.default;
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start';
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
  return `${start} - ${end}`;
};
