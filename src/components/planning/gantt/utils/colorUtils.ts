
import { Task } from '@/types/database';

export const getConstructionPhaseColor = (task: Task): string => {
  // Priority-based coloring
  if (task.priority === 'critical') {
    return 'bg-red-500 text-white';
  }
  if (task.priority === 'high') {
    return 'bg-orange-500 text-white';
  }

  // Category-based coloring for construction phases
  switch (task.category?.toLowerCase()) {
    case 'foundation':
      return 'bg-stone-500 text-white';
    case 'framing':
      return 'bg-amber-600 text-white';
    case 'electrical':
      return 'bg-yellow-600 text-white';
    case 'plumbing':
      return 'bg-blue-600 text-white';
    case 'hvac':
      return 'bg-cyan-600 text-white';
    case 'roofing':
      return 'bg-slate-600 text-white';
    case 'flooring':
      return 'bg-orange-600 text-white';
    case 'painting':
      return 'bg-purple-600 text-white';
    case 'inspection':
      return 'bg-green-600 text-white';
    case 'cleanup':
      return 'bg-gray-500 text-white';
    default:
      // Status-based fallback using correct task status values
      switch (task.status) {
        case 'completed':
          return 'bg-green-500 text-white';
        case 'in-progress':
          return 'bg-blue-500 text-white';
        case 'blocked':
          return 'bg-red-600 text-white';
        case 'not-started':
        default:
          return 'bg-slate-500 text-white';
      }
  }
};

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'not-started':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
