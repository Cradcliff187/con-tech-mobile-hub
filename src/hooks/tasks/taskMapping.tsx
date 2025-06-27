
import { Task } from '@/types/database';

export const mapTaskFromDb = (dbTask: any): Task => {
  return {
    ...dbTask,
    task_type: dbTask.task_type === 'punch_list' ? 'punch_list' as const : 'regular' as const,
    // Ensure all required fields are properly typed
    priority: dbTask.priority || 'medium',
    status: dbTask.status || 'not-started',
    progress: dbTask.progress || 0,
  };
};
