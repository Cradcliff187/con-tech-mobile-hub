
import { LifecycleStatus } from './database';

/**
 * Project Status Configuration System
 * Provides centralized management of project lifecycle statuses
 */

// Status Categories for grouping and filtering
export type StatusCategory = 'planning' | 'construction' | 'completion' | 'other';

// Status Metadata Interface
export interface StatusMetadata {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  category: StatusCategory;
  order: number;
  isTerminal: boolean; // Cannot transition out of this status
}

// Status Configuration Map
export const STATUS_CONFIG: Record<LifecycleStatus, StatusMetadata> = {
  'pre_planning': {
    label: 'Pre-Planning',
    description: 'Initial project setup and preliminary planning',
    color: 'bg-slate-500',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    icon: 'Settings',
    category: 'planning',
    order: 1,
    isTerminal: false
  },
  'planning_active': {
    label: 'Active Planning',
    description: 'Detailed planning and design phase',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: 'Clock',
    category: 'planning',
    order: 2,
    isTerminal: false
  },
  'construction_active': {
    label: 'Construction Active',
    description: 'Active construction and execution phase',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: 'PlayCircle',
    category: 'construction',
    order: 3,
    isTerminal: false
  },
  'construction_hold': {
    label: 'Construction Hold',
    description: 'Construction temporarily paused',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: 'PauseCircle',
    category: 'construction',
    order: 4,
    isTerminal: false
  },
  'punch_list_phase': {
    label: 'Punch List',
    description: 'Final inspections and punch list completion',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: 'ListChecks',
    category: 'completion',
    order: 5,
    isTerminal: false
  },
  'project_closeout': {
    label: 'Project Closeout',
    description: 'Final documentation and handover',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: 'CheckCircle',
    category: 'completion',
    order: 6,
    isTerminal: false
  },
  'project_completed': {
    label: 'Completed',
    description: 'Project successfully completed',
    color: 'bg-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'CheckCircle',
    category: 'completion',
    order: 7,
    isTerminal: true
  },
  'project_cancelled': {
    label: 'Cancelled',
    description: 'Project cancelled or terminated',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: 'XCircle',
    category: 'other',
    order: 8,
    isTerminal: true
  }
};

// Valid Status Transitions
export const STATUS_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  'pre_planning': ['planning_active', 'project_cancelled'],
  'planning_active': ['construction_active', 'construction_hold', 'project_cancelled'],
  'construction_active': ['punch_list_phase', 'construction_hold', 'project_cancelled'],
  'construction_hold': ['construction_active', 'project_cancelled'],
  'punch_list_phase': ['project_closeout', 'construction_active', 'project_cancelled'],
  'project_closeout': ['project_completed', 'punch_list_phase'],
  'project_completed': [], // Terminal state
  'project_cancelled': [] // Terminal state
};

// Transition Prerequisites
export interface TransitionPrerequisites {
  minCompletionPercentage?: number;
  requiredTasks?: string[];
  customValidation?: (project: any, tasks: any[]) => boolean;
  warningMessage?: string;
}

export const TRANSITION_PREREQUISITES: Record<string, TransitionPrerequisites> = {
  'pre_planning->planning_active': {
    minCompletionPercentage: 10,
    warningMessage: 'Ensure basic project setup is complete before advancing to active planning'
  },
  'planning_active->construction_active': {
    minCompletionPercentage: 80,
    warningMessage: 'Planning should be substantially complete before starting construction'
  },
  'construction_active->punch_list_phase': {
    minCompletionPercentage: 90,
    warningMessage: 'Construction should be at least 90% complete before entering punch list phase'
  },
  'punch_list_phase->project_closeout': {
    minCompletionPercentage: 95,
    customValidation: (project, tasks) => {
      const punchListTasks = tasks.filter(t => t.task_type === 'punch_list');
      return punchListTasks.every(t => t.status === 'completed');
    },
    warningMessage: 'All punch list items must be completed before project closeout'
  },
  'project_closeout->project_completed': {
    minCompletionPercentage: 100,
    warningMessage: 'All project tasks must be completed'
  }
};

// Legacy Status/Phase Mapping
export interface LegacyStatusMapping {
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  phase: 'planning' | 'active' | 'punch_list' | 'closeout' | 'completed';
}

export const LIFECYCLE_TO_LEGACY: Record<LifecycleStatus, LegacyStatusMapping> = {
  'pre_planning': { status: 'planning', phase: 'planning' },
  'planning_active': { status: 'active', phase: 'planning' },
  'construction_active': { status: 'active', phase: 'active' },
  'construction_hold': { status: 'on-hold', phase: 'active' },
  'punch_list_phase': { status: 'active', phase: 'punch_list' },
  'project_closeout': { status: 'active', phase: 'closeout' },
  'project_completed': { status: 'completed', phase: 'completed' },
  'project_cancelled': { status: 'cancelled', phase: 'planning' }
};

export const LEGACY_TO_LIFECYCLE: Record<string, LifecycleStatus> = {
  'planning-planning': 'pre_planning',
  'planning-active': 'planning_active',
  'active-planning': 'planning_active',
  'active-active': 'construction_active',
  'active-punch_list': 'punch_list_phase',
  'active-closeout': 'project_closeout',
  'active-completed': 'project_completed',
  'on-hold-active': 'construction_hold',
  'completed-completed': 'project_completed',
  'cancelled-planning': 'project_cancelled'
};

// Helper Functions

/**
 * Get status metadata for a lifecycle status
 */
export const getStatusMetadata = (status: LifecycleStatus): StatusMetadata => {
  return STATUS_CONFIG[status];
};

/**
 * Get human-readable label for a status
 */
export const getStatusLabel = (status: LifecycleStatus): string => {
  return STATUS_CONFIG[status].label;
};

/**
 * Get status color configuration
 */
export const getStatusColor = (status: LifecycleStatus): string => {
  return STATUS_CONFIG[status].color;
};

/**
 * Check if a status transition is valid
 */
export const isValidTransition = (from: LifecycleStatus, to: LifecycleStatus): boolean => {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
};

/**
 * Get valid next statuses for a given status
 */
export const getValidNextStatuses = (status: LifecycleStatus): LifecycleStatus[] => {
  return STATUS_TRANSITIONS[status] || [];
};

/**
 * Check if status transition prerequisites are met
 */
export const checkTransitionPrerequisites = (
  from: LifecycleStatus,
  to: LifecycleStatus,
  project: any,
  tasks: any[] = []
): { canTransition: boolean; warning?: string } => {
  const transitionKey = `${from}->${to}`;
  const prerequisites = TRANSITION_PREREQUISITES[transitionKey];

  if (!prerequisites) {
    return { canTransition: true };
  }

  // Check minimum completion percentage
  if (prerequisites.minCompletionPercentage && project.progress < prerequisites.minCompletionPercentage) {
    return {
      canTransition: false,
      warning: `Project must be at least ${prerequisites.minCompletionPercentage}% complete. Currently ${project.progress}%.`
    };
  }

  // Check custom validation
  if (prerequisites.customValidation && !prerequisites.customValidation(project, tasks)) {
    return {
      canTransition: false,
      warning: prerequisites.warningMessage || 'Custom validation failed'
    };
  }

  return {
    canTransition: true,
    warning: prerequisites.warningMessage
  };
};

/**
 * Get statuses by category
 */
export const getStatusesByCategory = (category: StatusCategory): LifecycleStatus[] => {
  return Object.entries(STATUS_CONFIG)
    .filter(([_, config]) => config.category === category)
    .sort(([_, a], [__, b]) => a.order - b.order)
    .map(([status]) => status as LifecycleStatus);
};

/**
 * Convert legacy status/phase to lifecycle status
 */
export const convertLegacyToLifecycle = (status: string, phase: string): LifecycleStatus => {
  const key = `${status}-${phase}`;
  return LEGACY_TO_LIFECYCLE[key] || 'pre_planning';
};

/**
 * Convert lifecycle status to legacy format
 */
export const convertLifecycleToLegacy = (lifecycleStatus: LifecycleStatus): LegacyStatusMapping => {
  return LIFECYCLE_TO_LEGACY[lifecycleStatus];
};

/**
 * Get status progression percentage (0-100)
 */
export const getStatusProgressionPercentage = (status: LifecycleStatus): number => {
  const totalSteps = Object.keys(STATUS_CONFIG).length - 1; // Exclude cancelled
  const currentStep = STATUS_CONFIG[status].order;
  
  if (status === 'project_cancelled') return 0;
  if (status === 'project_completed') return 100;
  
  return Math.round((currentStep / totalSteps) * 100);
};

/**
 * Check if a status is terminal (no further transitions)
 */
export const isTerminalStatus = (status: LifecycleStatus): boolean => {
  return STATUS_CONFIG[status].isTerminal;
};

/**
 * Get the next logical status in the progression
 */
export const getNextLogicalStatus = (status: LifecycleStatus): LifecycleStatus | null => {
  const validNext = getValidNextStatuses(status);
  
  // Filter out cancellation and find the progression status
  const progressionNext = validNext.filter(s => s !== 'project_cancelled');
  
  if (progressionNext.length === 1) {
    return progressionNext[0];
  }
  
  // If multiple options, return the one with the next order
  const currentOrder = STATUS_CONFIG[status].order;
  const nextStatus = progressionNext.find(s => STATUS_CONFIG[s].order === currentOrder + 1);
  
  return nextStatus || null;
};

/**
 * Filter and sort statuses for display
 */
export const getSortedStatuses = (includeTerminal: boolean = true): LifecycleStatus[] => {
  return Object.entries(STATUS_CONFIG)
    .filter(([_, config]) => includeTerminal || !config.isTerminal)
    .sort(([_, a], [__, b]) => a.order - b.order)
    .map(([status]) => status as LifecycleStatus);
};

// Type Guards
export const isLifecycleStatus = (value: string): value is LifecycleStatus => {
  return Object.keys(STATUS_CONFIG).includes(value);
};

export const isStatusCategory = (value: string): value is StatusCategory => {
  return ['planning', 'construction', 'completion', 'other'].includes(value);
};
