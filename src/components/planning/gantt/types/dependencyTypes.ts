
export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

export interface TaskDependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: DependencyType;
  lag_days: number;
  created_at: string;
  updated_at: string;
}

export interface DependencyValidationResult {
  isValid: boolean;
  conflicts: string[];
  suggestions: string[];
  criticalPath?: string[];
}

export interface DependencyVisualization {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  pathData: string;
  isOnCriticalPath: boolean;
  hasConflict: boolean;
}
