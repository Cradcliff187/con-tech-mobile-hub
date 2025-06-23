
// Unified Project Lifecycle Status Types
// This provides the new consolidated status system for construction projects

export type UnifiedLifecycleStatus = 
  | 'pre_construction'
  | 'mobilization' 
  | 'construction'
  | 'punch_list'
  | 'final_inspection'
  | 'closeout'
  | 'warranty'
  | 'on_hold'
  | 'cancelled';

// Status transition validation result
export interface StatusTransitionValidation {
  is_valid: boolean;
  error_message?: string;
  required_conditions: Record<string, any>;
}

// Status transition definition
export interface StatusTransition {
  id: string;
  from_status: UnifiedLifecycleStatus;
  to_status: UnifiedLifecycleStatus;
  required_conditions: Record<string, any>;
  min_progress_threshold: number;
  requires_approval: boolean;
  transition_name: string;
  description?: string;
  created_at: string;
  is_active: boolean;
}

// Extended project interface with unified lifecycle status
export interface ProjectWithUnifiedStatus extends Omit<import('./database').Project, 'unified_lifecycle_status'> {
  unified_lifecycle_status?: UnifiedLifecycleStatus;
}

// Status metadata for UI display
export interface StatusMetadata {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  category: 'planning' | 'active' | 'completion' | 'inactive';
  order: number;
  isTerminal: boolean;
}

// Status configuration map
export const UNIFIED_STATUS_CONFIG: Record<UnifiedLifecycleStatus, StatusMetadata> = {
  'pre_construction': {
    label: 'Pre-Construction',
    description: 'Initial project setup and planning phase',
    color: 'bg-slate-500',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    category: 'planning',
    order: 1,
    isTerminal: false
  },
  'mobilization': {
    label: 'Mobilization',
    description: 'Mobilizing resources and equipment to site',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    category: 'planning',
    order: 2,
    isTerminal: false
  },
  'construction': {
    label: 'Construction',
    description: 'Active construction work in progress',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    category: 'active',
    order: 3,
    isTerminal: false
  },
  'punch_list': {
    label: 'Punch List',
    description: 'Final quality inspections and corrections',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    category: 'completion',
    order: 4,
    isTerminal: false
  },
  'final_inspection': {
    label: 'Final Inspection',
    description: 'Municipal and client final inspections',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    category: 'completion',
    order: 5,
    isTerminal: false
  },
  'closeout': {
    label: 'Project Closeout',
    description: 'Administrative and financial closeout',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    category: 'completion',
    order: 6,
    isTerminal: false
  },
  'warranty': {
    label: 'Warranty Period',
    description: 'Project complete, warranty period active',
    color: 'bg-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    category: 'completion',
    order: 7,
    isTerminal: true
  },
  'on_hold': {
    label: 'On Hold',
    description: 'Project temporarily suspended',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    category: 'inactive',
    order: 8,
    isTerminal: false
  },
  'cancelled': {
    label: 'Cancelled',
    description: 'Project permanently cancelled',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    category: 'inactive',
    order: 9,
    isTerminal: true
  }
};
