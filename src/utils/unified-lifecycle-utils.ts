
import { supabase } from '@/integrations/supabase/client';
import { 
  UnifiedLifecycleStatus, 
  StatusTransitionValidation, 
  StatusTransition, 
  UNIFIED_STATUS_CONFIG,
  ProjectWithUnifiedStatus 
} from '@/types/unified-lifecycle';
import { Project } from '@/types/database';

/**
 * Get the unified lifecycle status for a project, with fallback to legacy mapping
 */
export const getUnifiedLifecycleStatus = (project: ProjectWithUnifiedStatus): UnifiedLifecycleStatus => {
  // If unified_lifecycle_status is set, use it
  if (project.unified_lifecycle_status) {
    return project.unified_lifecycle_status;
  }

  // Fallback to legacy mapping logic for backward compatibility
  const { status, phase } = project;

  if (status === 'cancelled') return 'cancelled';
  
  if (status === 'planning') {
    if (!phase || phase === 'planning') return 'pre_construction';
    if (phase === 'active') return 'mobilization';
  }
  
  if (status === 'active') {
    if (!phase || phase === 'planning') return 'mobilization';
    if (phase === 'active') return 'construction';
    if (phase === 'punch_list') return 'punch_list';
    if (phase === 'closeout') return 'closeout';
    if (phase === 'completed') return 'warranty';
  }
  
  if (status === 'on-hold') return 'on_hold';
  if (status === 'completed') return 'warranty';
  
  return 'pre_construction';
};

/**
 * Get display metadata for a lifecycle status
 */
export const getStatusMetadata = (status: UnifiedLifecycleStatus) => {
  return UNIFIED_STATUS_CONFIG[status];
};

/**
 * Get human-readable label for a lifecycle status
 */
export const getStatusLabel = (status: UnifiedLifecycleStatus): string => {
  return UNIFIED_STATUS_CONFIG[status].label;
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (status: UnifiedLifecycleStatus): string => {
  return UNIFIED_STATUS_CONFIG[status].color;
};

/**
 * Check if a status transition is valid
 */
export const validateStatusTransition = async (
  projectId: string,
  newStatus: UnifiedLifecycleStatus
): Promise<StatusTransitionValidation> => {
  const { data, error } = await supabase
    .rpc('validate_project_status_transition', {
      project_id: projectId,
      new_status: newStatus
    });

  if (error) {
    console.error('Error validating status transition:', error);
    return {
      is_valid: false,
      error_message: 'Failed to validate transition',
      required_conditions: {}
    };
  }

  // Fix type mismatch by ensuring proper type conversion
  const result = data?.[0];
  if (result) {
    return {
      is_valid: result.is_valid,
      error_message: result.error_message,
      required_conditions: typeof result.required_conditions === 'object' 
        ? result.required_conditions as Record<string, any>
        : {}
    };
  }

  return {
    is_valid: false,
    error_message: 'No validation result',
    required_conditions: {}
  };
};

/**
 * Get available status transitions for a project
 */
export const getAvailableTransitions = async (
  currentStatus: UnifiedLifecycleStatus
): Promise<StatusTransition[]> => {
  const { data, error } = await supabase
    .from('project_status_transitions')
    .select('*')
    .eq('from_status', currentStatus)
    .eq('is_active', true)
    .order('min_progress_threshold');

  if (error) {
    console.error('Error fetching available transitions:', error);
    return [];
  }

  // Fix type mismatch by ensuring proper type conversion
  return (data || []).map(item => ({
    ...item,
    required_conditions: typeof item.required_conditions === 'object' 
      ? item.required_conditions as Record<string, any>
      : {}
  }));
};

/**
 * Update project unified lifecycle status
 */
export const updateProjectStatus = async (
  projectId: string,
  newStatus: UnifiedLifecycleStatus
): Promise<{ success: boolean; error?: string }> => {
  // First validate the transition
  const validation = await validateStatusTransition(projectId, newStatus);
  
  if (!validation.is_valid) {
    return {
      success: false,
      error: validation.error_message || 'Invalid status transition'
    };
  }

  // Update the project status
  const { error } = await supabase
    .from('projects')
    .update({ unified_lifecycle_status: newStatus })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project status:', error);
    return {
      success: false,
      error: error.message
    };
  }

  return { success: true };
};

/**
 * Get projects by unified lifecycle status
 */
export const getProjectsByStatus = (
  projects: ProjectWithUnifiedStatus[],
  status: UnifiedLifecycleStatus
): ProjectWithUnifiedStatus[] => {
  return projects.filter(project => getUnifiedLifecycleStatus(project) === status);
};

/**
 * Get status distribution for projects
 */
export const getStatusDistribution = (projects: ProjectWithUnifiedStatus[]) => {
  const distribution: Record<UnifiedLifecycleStatus, number> = {
    'pre_construction': 0,
    'mobilization': 0,
    'construction': 0,
    'punch_list': 0,
    'final_inspection': 0,
    'closeout': 0,
    'warranty': 0,
    'on_hold': 0,
    'cancelled': 0
  };

  projects.forEach(project => {
    const status = getUnifiedLifecycleStatus(project);
    distribution[status]++;
  });

  return distribution;
};

/**
 * Check if status allows certain actions
 */
export const canCreateTasks = (status: UnifiedLifecycleStatus): boolean => {
  return !['cancelled', 'warranty'].includes(status);
};

export const canModifyProject = (status: UnifiedLifecycleStatus): boolean => {
  return !['cancelled', 'warranty'].includes(status);
};

export const isActiveStatus = (status: UnifiedLifecycleStatus): boolean => {
  return ['mobilization', 'construction', 'punch_list', 'final_inspection', 'closeout'].includes(status);
};

export const isCompletedStatus = (status: UnifiedLifecycleStatus): boolean => {
  return ['warranty', 'cancelled'].includes(status);
};

/**
 * Get next logical status in the workflow
 */
export const getNextStatus = (currentStatus: UnifiedLifecycleStatus): UnifiedLifecycleStatus | null => {
  const statusOrder: UnifiedLifecycleStatus[] = [
    'pre_construction',
    'mobilization', 
    'construction',
    'punch_list',
    'final_inspection',
    'closeout',
    'warranty'
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
    return null;
  }

  return statusOrder[currentIndex + 1];
};

/**
 * Map unified lifecycle status back to legacy status/phase for backward compatibility
 */
export const mapToLegacyStatus = (unifiedStatus: UnifiedLifecycleStatus): { status: Project['status'], phase: Project['phase'] } => {
  switch (unifiedStatus) {
    case 'pre_construction':
      return { status: 'planning', phase: 'planning' };
    case 'mobilization':
      return { status: 'active', phase: 'active' };
    case 'construction':
      return { status: 'active', phase: 'active' };
    case 'punch_list':
      return { status: 'active', phase: 'punch_list' };
    case 'final_inspection':
      return { status: 'active', phase: 'punch_list' };
    case 'closeout':
      return { status: 'active', phase: 'closeout' };
    case 'warranty':
      return { status: 'completed', phase: 'completed' };
    case 'on_hold':
      return { status: 'on-hold', phase: 'active' };
    case 'cancelled':
      return { status: 'cancelled', phase: 'planning' };
    default:
      return { status: 'planning', phase: 'planning' };
  }
};
