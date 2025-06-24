import { useState, useCallback, useRef } from 'react';
import { Task } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export interface ActionSnapshot {
  id: string;
  type: 'move' | 'update' | 'create' | 'delete' | 'bulk';
  timestamp: number;
  description: string;
  taskId: string;
  taskIds?: string[]; // for bulk operations
  beforeState: Partial<Task>;
  afterState: Partial<Task>;
  beforeStates?: Record<string, Partial<Task>>; // for bulk operations
  afterStates?: Record<string, Partial<Task>>; // for bulk operations
}

interface UseActionHistoryProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  onBulkTaskUpdate?: (updates: Array<{ id: string; updates: Partial<Task> }>) => Promise<any>;
}

export const useActionHistory = ({ 
  tasks, 
  onTaskUpdate, 
  onBulkTaskUpdate 
}: UseActionHistoryProps) => {
  const [history, setHistory] = useState<ActionSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const actionIdCounter = useRef(0);

  const generateActionId = () => `action_${Date.now()}_${++actionIdCounter.current}`;

  const getTaskState = useCallback((taskId: string): Partial<Task> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return {};
    
    return {
      id: task.id,
      title: task.title,
      start_date: task.start_date,
      due_date: task.due_date,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      description: task.description,
      category: task.category
    };
  }, [tasks]);

  const recordAction = useCallback((action: Omit<ActionSnapshot, 'id' | 'timestamp'>) => {
    if (isPerformingAction) return; // Don't record actions during undo/redo

    const newAction: ActionSnapshot = {
      ...action,
      id: generateActionId(),
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove any actions after current index (when we're not at the end)
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newAction);
      
      // Keep only last 50 actions to prevent memory issues
      if (newHistory.length > 50) {
        return newHistory.slice(-50);
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, isPerformingAction]);

  const recordTaskMove = useCallback((taskId: string, beforeState: Partial<Task>, afterState: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    recordAction({
      type: 'move',
      description: `Move "${task.title}"`,
      taskId,
      beforeState,
      afterState
    });
  }, [tasks, recordAction]);

  const recordTaskUpdate = useCallback((taskId: string, beforeState: Partial<Task>, afterState: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    recordAction({
      type: 'update',
      description: `Update "${task.title}"`,
      taskId,
      beforeState,
      afterState
    });
  }, [tasks, recordAction]);

  const recordBulkUpdate = useCallback((updates: Array<{ id: string; before: Partial<Task>; after: Partial<Task> }>) => {
    if (updates.length === 0) return;

    const beforeStates: Record<string, Partial<Task>> = {};
    const afterStates: Record<string, Partial<Task>> = {};
    const taskIds: string[] = [];

    updates.forEach(({ id, before, after }) => {
      beforeStates[id] = before;
      afterStates[id] = after;
      taskIds.push(id);
    });

    recordAction({
      type: 'bulk',
      description: `Update ${updates.length} task${updates.length !== 1 ? 's' : ''}`,
      taskId: updates[0].id, // Primary task for compatibility
      taskIds,
      beforeState: beforeStates[updates[0].id],
      afterState: afterStates[updates[0].id],
      beforeStates,
      afterStates
    });
  }, [recordAction]);

  const undo = useCallback(async () => {
    if (currentIndex < 0 || isPerformingAction) return false;

    const action = history[currentIndex];
    if (!action) return false;

    setIsPerformingAction(true);

    try {
      if (action.type === 'bulk' && action.beforeStates && action.taskIds) {
        // Handle bulk undo
        const updates = action.taskIds.map(taskId => ({
          id: taskId,
          updates: action.beforeStates![taskId]
        }));

        if (onBulkTaskUpdate) {
          await onBulkTaskUpdate(updates);
        } else {
          // Fallback to individual updates
          for (const update of updates) {
            await onTaskUpdate(update.id, update.updates);
          }
        }
      } else {
        // Handle single task undo
        await onTaskUpdate(action.taskId, action.beforeState);
      }

      setCurrentIndex(prev => prev - 1);
      
      toast({
        title: "Action Undone",
        description: action.description,
      });

      return true;
    } catch (error) {
      toast({
        title: "Undo Failed",
        description: error instanceof Error ? error.message : "Failed to undo action",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsPerformingAction(false);
    }
  }, [currentIndex, history, isPerformingAction, onTaskUpdate, onBulkTaskUpdate]);

  const redo = useCallback(async () => {
    if (currentIndex >= history.length - 1 || isPerformingAction) return false;

    const action = history[currentIndex + 1];
    if (!action) return false;

    setIsPerformingAction(true);

    try {
      if (action.type === 'bulk' && action.afterStates && action.taskIds) {
        // Handle bulk redo
        const updates = action.taskIds.map(taskId => ({
          id: taskId,
          updates: action.afterStates![taskId]
        }));

        if (onBulkTaskUpdate) {
          await onBulkTaskUpdate(updates);
        } else {
          // Fallback to individual updates
          for (const update of updates) {
            await onTaskUpdate(update.id, update.updates);
          }
        }
      } else {
        // Handle single task redo
        await onTaskUpdate(action.taskId, action.afterState);
      }

      setCurrentIndex(prev => prev + 1);
      
      toast({
        title: "Action Redone",
        description: action.description,
      });

      return true;
    } catch (error) {
      toast({
        title: "Redo Failed",
        description: error instanceof Error ? error.message : "Failed to redo action",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsPerformingAction(false);
    }
  }, [currentIndex, history, isPerformingAction, onTaskUpdate, onBulkTaskUpdate]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex >= 0 && !isPerformingAction;
  const canRedo = currentIndex < history.length - 1 && !isPerformingAction;

  const getUndoDescription = () => {
    if (!canUndo) return null;
    return history[currentIndex]?.description || null;
  };

  const getRedoDescription = () => {
    if (!canRedo) return null;
    return history[currentIndex + 1]?.description || null;
  };

  return {
    // State
    canUndo,
    canRedo,
    isPerformingAction,
    historyLength: history.length,
    currentIndex,
    
    // Actions
    undo,
    redo,
    clearHistory,
    
    // Recording functions
    recordTaskMove,
    recordTaskUpdate,
    recordBulkUpdate,
    getTaskState,
    
    // Descriptions
    getUndoDescription,
    getRedoDescription,
    
    // History (for debugging)
    history: history.slice(0, currentIndex + 1) // Only show actions up to current index
  };
};
