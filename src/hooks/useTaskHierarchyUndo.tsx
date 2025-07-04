import { useState, useCallback, useRef } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface UndoAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
  description: string;
  data: {
    taskId: string;
    before?: Partial<Task>;
    after?: Partial<Task>;
  };
}

const MAX_UNDO_ACTIONS = 20;

export const useTaskHierarchyUndo = () => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const { updateTask, createTask } = useTasks();
  const { toast } = useToast();

  const addUndoAction = useCallback((action: Omit<UndoAction, 'id' | 'timestamp'>) => {
    if (isUndoing) return; // Don't track undo/redo operations
    
    const undoAction: UndoAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setUndoStack(prev => {
      const newStack = [undoAction, ...prev];
      return newStack.slice(0, MAX_UNDO_ACTIONS);
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [isUndoing]);

  const undo = useCallback(async () => {
    if (undoStack.length === 0) return;

    const action = undoStack[0];
    setIsUndoing(true);

    try {
      let success = false;

      switch (action.type) {
        case 'update':
          if (action.data.before) {
            const result = await updateTask(action.data.taskId, action.data.before);
            success = !result.error;
          }
          break;
        case 'delete':
          if (action.data.before) {
            const result = await updateTask(action.data.taskId, {
              status: action.data.before.status || 'not-started',
              description: action.data.before.description
            });
            success = !result.error;
          }
          break;
        case 'create':
          // For create operations, we'd need a delete function
          // For now, mark as blocked with [DELETED] prefix
          const result = await updateTask(action.data.taskId, {
            status: 'blocked',
            description: `[DELETED] ${action.data.after?.description || ''}`
          });
          success = !result.error;
          break;
      }

      if (success) {
        setUndoStack(prev => prev.slice(1));
        setRedoStack(prev => [action, ...prev]);
        
        toast({
          title: "Action Undone",
          description: action.description,
          variant: "default"
        });
      } else {
        throw new Error('Failed to undo action');
      }
    } catch (error) {
      console.error('Undo failed:', error);
      toast({
        title: "Undo Failed",
        description: "Could not undo the last action",
        variant: "destructive"
      });
    } finally {
      setIsUndoing(false);
    }
  }, [undoStack, updateTask, toast]);

  const redo = useCallback(async () => {
    if (redoStack.length === 0) return;

    const action = redoStack[0];
    setIsUndoing(true);

    try {
      let success = false;

      switch (action.type) {
        case 'update':
          if (action.data.after) {
            const result = await updateTask(action.data.taskId, action.data.after);
            success = !result.error;
          }
          break;
        case 'delete':
          const result = await updateTask(action.data.taskId, {
            status: 'blocked',
            description: `[DELETED] ${action.data.before?.description || ''}`
          });
          success = !result.error;
          break;
        case 'create':
          if (action.data.after) {
            const result = await createTask(action.data.after as Partial<Task>);
            success = !result.error;
          }
          break;
      }

      if (success) {
        setRedoStack(prev => prev.slice(1));
        setUndoStack(prev => [action, ...prev]);
        
        toast({
          title: "Action Redone",
          description: action.description,
          variant: "default"
        });
      } else {
        throw new Error('Failed to redo action');
      }
    } catch (error) {
      console.error('Redo failed:', error);
      toast({
        title: "Redo Failed",
        description: "Could not redo the action",
        variant: "destructive"
      });
    } finally {
      setIsUndoing(false);
    }
  }, [redoStack, updateTask, createTask, toast]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    addUndoAction,
    undo,
    redo,
    canUndo,
    canRedo,
    isUndoing,
    undoStack: undoStack.slice(0, 5), // Only return recent actions for UI
    redoStack: redoStack.slice(0, 5)
  };
};