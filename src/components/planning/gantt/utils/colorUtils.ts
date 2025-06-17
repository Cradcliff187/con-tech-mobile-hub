
import { Task } from '@/types/database';

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
