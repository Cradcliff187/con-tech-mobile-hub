import { Task } from '@/types/database';
import { Dispatch } from 'react';

export interface GanttContextValue {
  state: GanttState;
  dispatch: Dispatch<GanttAction>;
  getDisplayTask: (taskId: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  updateTaskOptimistic: (id: string, updates: Partial<Task>) => void;
  clearOptimisticUpdate: (id: string) => void;
  clearAllOptimisticUpdates: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<GanttState['filters']>) => void;
  setViewMode: (mode: 'days' | 'weeks' | 'months') => void;
  selectTask: (taskId: string | null) => void;
  setViewport: (start: Date, end: Date) => void;
  setShowMiniMap: (show: boolean) => void;
  navigateToDate: (date: Date) => void;
  startDrag: (task: Task) => void;
  updateDragPreview: (date: Date, validity: 'valid' | 'warning' | 'invalid', messages?: string[]) => void;
  completeDrag: (updates: Partial<Task>) => Promise<void>;
  cancelDrag: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;
}

export type GanttAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'CLEAR_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'CLEAR_ALL_OPTIMISTIC_UPDATES' }
  | { type: 'SET_SELECTED_TASK'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<GanttState['filters']> }
  | { type: 'SET_VIEW_MODE'; payload: 'days' | 'weeks' | 'months' }
  | { type: 'SET_VIEWPORT'; payload: { start: Date; end: Date } }
  | { type: 'SET_SHOW_MINIMAP'; payload: boolean }
  | { type: 'SET_DRAG_STATE'; payload: Partial<GanttState['dragState']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean };

export interface GanttState {
  // Timeline and Viewport
  currentViewStart: Date;
  currentViewEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  showMiniMap: boolean;
  
  // Tasks and Data
  tasks: Task[];
  optimisticUpdates: Map<string, Partial<Task>>;
  
  // UI State
  selectedTaskId: string | null;
  searchQuery: string;
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    phase: string[];
  };
  
  // Drag and Drop
  dragState: {
    isDragging: boolean;
    draggedTask: Task | null;
    dropPreviewDate: Date | null;
    currentValidity: 'valid' | 'warning' | 'invalid';
    violationMessages: string[];
  };
  
  // Loading and Error States
  loading: boolean;
  error: string | null;
  saving: boolean;
}
