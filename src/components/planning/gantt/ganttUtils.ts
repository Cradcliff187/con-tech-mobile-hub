
import { AlertTriangle, CheckCircle, User, Play, PauseCircle } from 'lucide-react';
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

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />;
    case 'high': return <AlertTriangle size={14} className="text-orange-600 flex-shrink-0" />;
    default: return null;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle size={12} className="text-white" />;
    case 'in-progress': return <Play size={12} className="text-white" />;
    case 'blocked': return <AlertTriangle size={12} className="text-white" />;
    case 'on-hold': return <PauseCircle size={12} className="text-white" />;
    default: return null;
  }
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
