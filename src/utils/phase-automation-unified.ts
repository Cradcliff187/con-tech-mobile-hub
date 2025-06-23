
import { Task, Project, LifecycleStatus } from '@/types/database';
import { getLifecycleStatus, canAdvanceLifecycleStatus } from './lifecycle-status';

/**
 * Updated phase automation utilities that use the unified lifecycle status system
 * This replaces the old phase-automation.ts with lifecycle-aware logic
 */

export const calculatePhaseReadiness = (project: Project, tasks: Task[]) => {
  const lifecycleStatus = getLifecycleStatus(project);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const budgetUsage = (project.spent || 0) / (project.budget || 1);
  const punchListTasks = tasks.filter(t => t.task_type === 'punch_list');
  
  // Use lifecycle-aware advancement logic
  const canAdvance = canAdvanceLifecycleStatus(project, tasks);
  
  // Determine if should generate punch list based on lifecycle status
  const shouldGeneratePunchList = lifecycleStatus === 'construction_active' && 
                                  completionRate >= 0.85 && 
                                  punchListTasks.length === 0;

  // Determine if can advance to closeout
  const canAdvanceToCloseout = lifecycleStatus === 'punch_list_phase' && 
                               punchListTasks.every(t => t.status === 'completed') && 
                               completionRate >= 0.95;

  return {
    lifecycleStatus,
    canAdvanceToPunchList: lifecycleStatus === 'construction_active' && completionRate >= 0.9,
    canAdvanceToCloseout,
    canAdvance,
    shouldGeneratePunchList,
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

// Legacy compatibility - maps old phase names to lifecycle status
export const mapLegacyPhaseToLifecycle = (phase: string): LifecycleStatus => {
  switch (phase) {
    case 'planning':
      return 'pre_planning';
    case 'active':
      return 'construction_active';
    case 'punch_list':
      return 'punch_list_phase';
    case 'closeout':
      return 'project_closeout';
    case 'completed':
      return 'project_completed';
    default:
      return 'pre_planning';
  }
};
