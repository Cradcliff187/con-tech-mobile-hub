
import { Task } from '@/types/database';

// Filter state interface for Gantt filters
export interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  phase: string[];
}

// Filter change handler type
export type FilterChangeHandler = (filterType: string, values: string[]) => void;

// Debug preferences interface
export interface DebugPreferences {
  showColumnInfo: boolean;
  showTaskDetails: boolean;
  showGridLines: boolean;
  showPerformanceMetrics: boolean;
  showScrollInfo: boolean;
  showSubscriptions: boolean;
  showAuthState: boolean;
}

// Task date migration interface
export interface TaskDateMigrationData {
  taskId: string;
  originalStartDate: Date | null;
  originalDueDate: Date | null;
  migratedStartDate: Date;
  migratedDueDate: Date;
}

// Task update data interface for migration operations
export interface TaskUpdateData {
  id: string;
  updates: Partial<Task>;
  timestamp: Date;
  source: 'user' | 'migration' | 'system';
}

// Subscription channel info interface - fixed to match actual return type
export interface SubscriptionChannelInfo {
  key: string;
  callbackCount: number;
  status: string;
  config: {
    table?: string;
    schema?: string;
    event?: string;
    filter?: Record<string, any>;
  };
}

// Enhanced drag state interface (simplified)
export interface SimplifiedDragState {
  dropPreviewDate: Date | null;
  dragPosition: { x: number; y: number } | null;
  currentValidity: 'valid' | 'warning' | 'invalid';
  violationMessages: string[];
  suggestedDropDate: Date | null;
}

// Drag and drop state interface with proper typing
export interface DragAndDropState {
  isDragging: boolean;
  draggedTask: Task | null;
  dropPreviewDate: Date | null;
  currentValidity: 'valid' | 'warning' | 'invalid';
  violationMessages: string[];
  suggestedDropDate: Date | null;
  dragPosition: { x: number; y: number } | null;
  localTaskUpdates: Record<string, Partial<Task>>;
  
  // Handlers with proper types
  handleDragStart: (e: React.DragEvent, task: Task) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  
  // Utility methods
  getUpdatedTask: (task: Task) => Task;
  resetLocalUpdates: () => void;
}

// Debug mode hook return type
export interface DebugModeHook {
  isDebugMode: boolean;
  debugPreferences: DebugPreferences;
  toggleDebugMode: () => void;
  updateDebugPreference: (key: keyof DebugPreferences, value: boolean) => void;
  isDevelopment: boolean;
}

// Project interface (imported from database types)
export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  phase: 'planning' | 'active' | 'punch_list' | 'closeout' | 'completed';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  progress: number;
  location?: string;
  project_manager_id?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

// Gantt chart hook return type with proper typing
export interface GanttChartHook {
  projectTasks: Task[];
  filteredTasks: Task[];
  displayTasks: Task[];
  loading: boolean;
  error: string | null;
  selectedProject: ProjectData | null;
  timelineStart: Date;
  timelineEnd: Date;
  timelineRef: React.RefObject<HTMLDivElement>;
  timelineRect: DOMRect | null;
  totalDays: number;
  selectedTaskId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  viewMode: 'days' | 'weeks' | 'months';
  setViewMode: (mode: 'days' | 'weeks' | 'months') => void;
  completedTasks: number;
  handleTaskSelect: (taskId: string) => void;
  handleFilterChange: FilterChangeHandler;
  dragAndDrop: DragAndDropState;
  isDebugMode: boolean;
  debugPreferences: DebugPreferences;
  toggleDebugMode: () => void;
  updateDebugPreference: (key: keyof DebugPreferences, value: boolean) => void;
  isDevelopment: boolean;
  optimisticUpdatesCount: number;
  isDragging: boolean;
}
