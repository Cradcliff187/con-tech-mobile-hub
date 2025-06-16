
import { Task, Project } from '@/types/database';

export const calculatePhaseReadiness = (project: Project, tasks: Task[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const budgetUsage = (project.spent || 0) / (project.budget || 1);
  const punchListTasks = tasks.filter(t => t.task_type === 'punch_list');
  
  return {
    canAdvanceToPunchList: completionRate >= 0.9 && project.phase === 'active',
    canAdvanceToCloseout: completionRate >= 0.95 && project.phase === 'punch_list' && punchListTasks.every(t => t.status === 'completed'),
    shouldGeneratePunchList: completionRate >= 0.85 && punchListTasks.length === 0 && project.phase === 'active',
    readinessScore: Math.min(completionRate * 100, 100),
    completionRate,
    budgetUsage: budgetUsage * 100,
    totalTasks,
    completedTasks,
    punchListTasks: punchListTasks.length
  };
};

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
