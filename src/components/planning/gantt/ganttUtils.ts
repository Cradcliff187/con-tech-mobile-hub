import { Task } from '@/types/database';

export const getDaysBetween = (start: Date, end: Date) => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const getTaskPosition = (task: Task, timelineStart: Date, timelineEnd: Date) => {
  const taskStart = new Date(task.start_date || task.created_at);
  const taskEnd = new Date(task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const totalDays = getDaysBetween(timelineStart, timelineEnd);
  const daysFromStart = getDaysBetween(timelineStart, taskStart);
  const taskDuration = getDaysBetween(taskStart, taskEnd);
  
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
  const start = new Date(task.start_date || task.created_at);
  const end = new Date(task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  return getDaysBetween(start, end);
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
