
import { Task, Project, LifecycleStatus } from '@/types/database';
import { getLifecycleStatus } from './lifecycle-status';

export const shouldShowPunchList = (project: Project) => {
  const lifecycleStatus = getLifecycleStatus(project);
  return ['punch_list_phase', 'project_closeout', 'project_completed'].includes(lifecycleStatus);
};

export const canConvertToPunchList = (task: Task, project: Project) => {
  const lifecycleStatus = getLifecycleStatus(project);
  return task.task_type === 'regular' && 
         task.status !== 'completed' &&
         (task.progress ?? 0) > 80 &&
         ['construction_active', 'punch_list_phase'].includes(lifecycleStatus);
};
