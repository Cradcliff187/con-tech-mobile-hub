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

export const getTaskDuration = (task: Task): number => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  return getDaysBetween(calculatedStartDate, calculatedEndDate);
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

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'in-progress': return 'bg-blue-500';
    case 'blocked': return 'bg-red-500';
    case 'on-hold': return 'bg-yellow-500';
    default: return 'bg-slate-400';
  }
};

export const getConstructionPhaseColor = (task: Task) => {
  const category = task.category?.toLowerCase() || '';
  const taskType = task.task_type || 'regular';
  
  if (taskType === 'punch_list') return 'bg-purple-500';
  
  if (category.includes('foundation')) return 'bg-amber-600';
  if (category.includes('framing') || category.includes('structure')) return 'bg-orange-600';
  if (category.includes('electrical')) return 'bg-yellow-500';
  if (category.includes('plumbing')) return 'bg-blue-600';
  if (category.includes('hvac')) return 'bg-indigo-500';
  if (category.includes('finish') || category.includes('paint')) return 'bg-green-600';
  
  return getStatusColor(task.status);
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

export const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start';
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
  return `${start} - ${end}`;
};

export const getCategoryBadgeColor = (category?: string) => {
  if (!category) return 'bg-slate-100 text-slate-700';
  
  const cat = category.toLowerCase();
  if (cat.includes('foundation')) return 'bg-amber-100 text-amber-700';
  if (cat.includes('framing') || cat.includes('structure')) return 'bg-orange-100 text-orange-700';
  if (cat.includes('electrical')) return 'bg-yellow-100 text-yellow-700';
  if (cat.includes('plumbing')) return 'bg-blue-100 text-blue-700';
  if (cat.includes('hvac')) return 'bg-indigo-100 text-indigo-700';
  if (cat.includes('finish') || cat.includes('paint')) return 'bg-green-100 text-green-700';
  
  return 'bg-slate-100 text-slate-700';
};
