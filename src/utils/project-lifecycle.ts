
import { Task } from '@/types/database';
import { Project } from '@/hooks/useProjects';

export const shouldShowPunchList = (project: Project) => {
  return ['punch_list', 'closeout', 'completed'].includes(project.phase);
};

export const canConvertToPunchList = (task: Task) => {
  return task.task_type === 'regular' && 
         task.status !== 'completed' &&
         (task.progress ?? 0) > 80;
};
