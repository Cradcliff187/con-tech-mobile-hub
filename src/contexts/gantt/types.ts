
import { Task } from '@/types/database';

// State Interface
export interface GanttState {
  // Task Data
  tasks: Task[];
  optimisticUpdates: Map<string, Partial<Task>>;
  
  // UI State
  selectedTaskId: string | null;
  searchQuery: string;
  viewMode: 'days' | 'weeks' | 'months';
  
  // Filter State
  filters: {
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  };
  
  // Timeline State
  timelineStart: Date;
  timelineEnd: Date;
  currentViewStart: Date;
  currentViewEnd: Date;
  showMiniMap: boolean;
  
  // Drag State
  dragState: {
    isDragging: boolean;
    draggedTask: Task | null;
    dropPreviewDate: Date | null;
    currentValidity: 'valid' | 'warning' | 'invalid';
    violationMessages: string[];
  };
  
  // Loading States
  loading: boolean;
  error: string | null;
  saving: boolean;
}

// Action Types
export type GanttAction = 
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'CLEAR_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<GanttState['filters']> }
  | { type: 'SET_VIEW_MODE'; payload: 'days' | 'weeks' | 'months' }
  | { type: 'SET_SELECTED_TASK'; payload: string | null }
  | { type: 'SET_TIMELINE_BOUNDS'; payload: { start: Date; end: Date } }
  | { type: 'SET_VIEWPORT'; payload: { start: Date; end: Date } }
  | { type: 'SET_SHOW_MINIMAP'; payload: boolean }
  | { type: 'SET_DRAG_STATE'; payload: Partial<GanttState['dragState']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean };

// Context Value Interface - simplified with dispatch
export interface GanttContextValue {
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
  
  // Helper methods (optional - can be implemented later)
  getDisplayTask?: (taskId: string) => Task | undefined;
  getFilteredTasks?: () => Task[];
  updateTaskOptimistic?: (id: string, updates: Partial<Task>) => void;
  clearOptimisticUpdate?: (id: string) => void;
  clearAllOptimisticUpdates?: () => void;
  
  // UI Actions (optional - can be implemented later)
  setSearchQuery?: (query: string) => void;
  setFilters?: (filters: Partial<GanttState['filters']>) => void;
  setViewMode?: (mode: 'days' | 'weeks' | 'months') => void;
  selectTask?: (taskId: string | null) => void;
  
  // Timeline Actions (optional - can be implemented later)
  setViewport?: (start: Date, end: Date) => void;
  setShowMiniMap?: (show: boolean) => void;
  navigateToDate?: (date: Date) => void;
  
  // Drag Operations (optional - can be implemented later)
  startDrag?: (task: Task) => void;
  updateDragPreview?: (date: Date, validity: 'valid' | 'warning' | 'invalid', messages?: string[]) => void;
  completeDrag?: (updates: Partial<Task>) => Promise<void>;
  cancelDrag?: () => void;
  
  // State Management (optional - can be implemented later)
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
  setSaving?: (saving: boolean) => void;
}
