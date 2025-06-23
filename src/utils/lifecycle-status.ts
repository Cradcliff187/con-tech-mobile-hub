
import { Project, LifecycleStatus } from '@/types/database';

/**
 * Compatibility utilities for the unified lifecycle status system
 * Provides mapping between old status/phase combinations and new lifecycle_status
 */

// Legacy status/phase to lifecycle_status mapping
export const getLifecycleStatus = (project: Project): LifecycleStatus => {
  // If lifecycle_status is already set, use it
  if (project.lifecycle_status) {
    return project.lifecycle_status;
  }

  // Fallback to legacy mapping logic
  const { status, phase } = project;

  // Cancelled projects always map to project_cancelled
  if (status === 'cancelled') return 'project_cancelled';
  
  // Planning status projects
  if (status === 'planning') {
    if (!phase || phase === 'planning') return 'pre_planning';
    if (phase === 'active') return 'planning_active';
  }
  
  // Active status projects  
  if (status === 'active') {
    if (!phase || phase === 'planning') return 'planning_active';
    if (phase === 'active') return 'construction_active';
    if (phase === 'punch_list') return 'punch_list_phase';
    if (phase === 'closeout') return 'project_closeout';
    if (phase === 'completed') return 'project_completed';
  }
  
  // On-hold projects
  if (status === 'on-hold') return 'construction_hold';
  
  // Completed projects
  if (status === 'completed') return 'project_completed';
  
  // Default fallback
  return 'pre_planning';
};

// Lifecycle status to legacy status/phase mapping (for backward compatibility)
export const getLegacyStatusFromLifecycle = (lifecycleStatus: LifecycleStatus): { status: Project['status'], phase: Project['phase'] } => {
  switch (lifecycleStatus) {
    case 'pre_planning':
      return { status: 'planning', phase: 'planning' };
    case 'planning_active':
      return { status: 'active', phase: 'planning' };
    case 'construction_active':
      return { status: 'active', phase: 'active' };
    case 'construction_hold':
      return { status: 'on-hold', phase: 'active' };
    case 'punch_list_phase':
      return { status: 'active', phase: 'punch_list' };
    case 'project_closeout':
      return { status: 'active', phase: 'closeout' };
    case 'project_completed':
      return { status: 'completed', phase: 'completed' };
    case 'project_cancelled':
      return { status: 'cancelled', phase: 'planning' };
    default:
      return { status: 'planning', phase: 'planning' };
  }
};

// Human-readable labels for lifecycle statuses
export const getLifecycleStatusLabel = (lifecycleStatus: LifecycleStatus): string => {
  switch (lifecycleStatus) {
    case 'pre_planning':
      return 'Pre-Planning';
    case 'planning_active':
      return 'Active Planning';
    case 'construction_active':
      return 'Construction Active';
    case 'construction_hold':
      return 'Construction Hold';
    case 'punch_list_phase':
      return 'Punch List';
    case 'project_closeout':
      return 'Project Closeout';
    case 'project_completed':
      return 'Completed';
    case 'project_cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

// Get color scheme for lifecycle status
export const getLifecycleStatusColor = (lifecycleStatus: LifecycleStatus): string => {
  switch (lifecycleStatus) {
    case 'pre_planning':
      return 'bg-slate-500';
    case 'planning_active':
      return 'bg-blue-500';
    case 'construction_active':
      return 'bg-green-500';
    case 'construction_hold':
      return 'bg-yellow-500';
    case 'punch_list_phase':
      return 'bg-orange-500';
    case 'project_closeout':
      return 'bg-purple-500';
    case 'project_completed':
      return 'bg-slate-600';
    case 'project_cancelled':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
};

// Check if project should show punch list functionality
export const shouldShowPunchList = (project: Project): boolean => {
  const lifecycleStatus = getLifecycleStatus(project);
  return ['punch_list_phase', 'project_closeout', 'project_completed'].includes(lifecycleStatus);
};

// Check if task can be converted to punch list
export const canConvertToPunchList = (task: any, project: Project): boolean => {
  const lifecycleStatus = getLifecycleStatus(project);
  return task.task_type === 'regular' && 
         task.status !== 'completed' &&
         (task.progress ?? 0) > 80 &&
         ['construction_active', 'punch_list_phase'].includes(lifecycleStatus);
};

// Get next lifecycle status for phase transitions
export const getNextLifecycleStatus = (currentLifecycleStatus: LifecycleStatus): LifecycleStatus | null => {
  switch (currentLifecycleStatus) {
    case 'pre_planning':
      return 'planning_active';
    case 'planning_active':
      return 'construction_active';
    case 'construction_active':
      return 'punch_list_phase';
    case 'punch_list_phase':
      return 'project_closeout';
    case 'project_closeout':
      return 'project_completed';
    case 'construction_hold':
      return 'construction_active'; // Resume from hold
    default:
      return null; // No next status for completed/cancelled
  }
};

// Check if lifecycle status can advance
export const canAdvanceLifecycleStatus = (project: Project, tasks: any[]): boolean => {
  const lifecycleStatus = getLifecycleStatus(project);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  switch (lifecycleStatus) {
    case 'pre_planning':
      return totalTasks > 0 && project.budget && project.budget > 0;
    case 'planning_active':
      return completionRate >= 0.1; // At least 10% tasks created and some started
    case 'construction_active':
      return completionRate >= 0.9; // 90% of tasks completed
    case 'punch_list_phase':
      const punchListTasks = tasks.filter(t => t.task_type === 'punch_list');
      return punchListTasks.every(t => t.status === 'completed') && completionRate >= 0.95;
    case 'project_closeout':
      return completionRate >= 1.0; // All tasks completed
    default:
      return false;
  }
};

// Get task defaults based on lifecycle status
export const getTaskDefaultsForLifecycleStatus = (lifecycleStatus: LifecycleStatus): Partial<any> => {
  switch (lifecycleStatus) {
    case 'punch_list_phase':
      return {
        task_type: 'punch_list',
        priority: 'high',
        required_skills: ['inspection', 'quality control'],
        estimated_hours: 2,
        punch_list_category: 'other',
        inspection_status: 'pending'
      };
    case 'project_closeout':
      return {
        task_type: 'regular',
        priority: 'high',
        required_skills: ['documentation', 'client relations'],
        estimated_hours: 4
      };
    case 'construction_active':
      return {
        task_type: 'regular',
        priority: 'medium',
        required_skills: ['construction', 'safety'],
        estimated_hours: 8
      };
    default:
      return {
        task_type: 'regular',
        priority: 'medium',
        estimated_hours: 8
      };
  }
};
