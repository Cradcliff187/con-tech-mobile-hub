
import { Task } from '@/types/database';

// Filter state interface for Gantt filters
export interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  phase: string[];
}

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

// Subscription channel info interface
export interface SubscriptionChannelInfo {
  key: string;
  callbackCount: number;
  status: string;
  config: {
    table?: string;
    schema?: string;
    event?: string;
    filter?: string;
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

// Debug mode hook return type
export interface DebugModeHook {
  isDebugMode: boolean;
  debugPreferences: DebugPreferences;
  toggleDebugMode: () => void;
  updateDebugPreference: (key: keyof DebugPreferences, value: boolean) => void;
  isDevelopment: boolean;
}

// Gantt chart hook return type
export interface GanttChartHook {
  projectTasks: Task[];
  filteredTasks: Task[];
  displayTasks: Task[];
  loading: boolean;
  error: string | null;
  selectedProject: any; // Will be typed properly with Project interface
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
  handleFilterChange: (filterType: string, values: string[]) => void;
  dragAndDrop: any; // Will be properly typed
  isDebugMode: boolean;
  debugPreferences: DebugPreferences;
  toggleDebugMode: () => void;
  updateDebugPreference: (key: keyof DebugPreferences, value: boolean) => void;
  isDevelopment: boolean;
  optimisticUpdatesCount: number;
  isDragging: boolean;
}
