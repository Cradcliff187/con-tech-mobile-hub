
import { Task } from '@/types/database';

export const generateAutoPunchListItems = (tasks: Task[]) => {
  return tasks
    .filter(task => (task.progress ?? 0) > 80 && task.status !== 'completed')
    .map(task => ({
      title: `Inspect: ${task.title}`,
      description: `Quality check and final inspection for ${task.title}`,
      task_type: 'punch_list' as const,
      punch_list_category: 'other' as const,
      priority: 'medium' as const,
      status: 'not-started' as const,
      project_id: task.project_id,
      converted_from_task_id: task.id,
      inspection_status: 'pending' as const
    }));
};
