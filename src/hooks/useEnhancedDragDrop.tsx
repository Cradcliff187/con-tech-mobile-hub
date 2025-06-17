
import { useState, useCallback, useRef, useMemo } from 'react';
import { Task } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// Core interfaces for operation tracking
interface DragOperation {
  id: string;
  taskId: string;
  originalData: Task;
  optimisticData: Partial<Task>;
  dependentOperations: string[];
  status: 'pending' | 'saving' | 'completed' | 'failed';
  timestamp: number;
  retryCount: number;
  errorMessage?: string;
}

interface ConflictResolution {
  strategy: 'overwrite' | 'merge' | 'abort';
  conflictingFields: string[];
  resolution: Record<string, any>;
}

interface DragPreview {
  task: Task | null;
  position: { x: number; y: number } | null;
  previewDate: Date | null;
  validity: 'valid' | 'warning' | 'invalid';
  violationMessages: string[];
}

interface BulkOperation {
  primaryTaskId: string | null;
  dependentTaskIds: string[];
  coordinatedSave: boolean;
  operationIds: string[];
}

interface EnhancedDragState {
  activeOperations: Map<string, DragOperation>;
  optimisticTasks: Map<string, Task>;
  conflictResolutions: Map<string, ConflictResolution>;
  dragPreview: DragPreview;
  bulkOperation: BulkOperation;
  isDragging: boolean;
  isSaving: boolean;
}

interface UseEnhancedDragDropProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ data?: any; error?: string }>;
  onTasksUpdate?: (tasks: Task[]) => void;
}

export const useEnhancedDragDrop = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  updateTask,
  onTasksUpdate
}: UseEnhancedDragDropProps) => {
  const { toast } = useToast();
  const operationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const [state, setState] = useState<EnhancedDragState>({
    activeOperations: new Map(),
    optimisticTasks: new Map(),
    conflictResolutions: new Map(),
    dragPreview: {
      task: null,
      position: null,
      previewDate: null,
      validity: 'valid',
      violationMessages: []
    },
    bulkOperation: {
      primaryTaskId: null,
      dependentTaskIds: [],
      coordinatedSave: false,
      operationIds: []
    },
    isDragging: false,
    isSaving: false
  });

  // Generate unique operation ID
  const generateOperationId = useCallback(() => {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get task with optimistic updates applied
  const getOptimisticTask = useCallback((taskId: string): Task | undefined => {
    const optimisticTask = state.optimisticTasks.get(taskId);
    if (optimisticTask) return optimisticTask;
    
    return tasks.find(t => t.id === taskId);
  }, [tasks, state.optimisticTasks]);

  // Get all tasks with optimistic updates
  const getOptimisticTasks = useMemo(() => {
    return tasks.map(task => {
      const optimisticTask = state.optimisticTasks.get(task.id);
      return optimisticTask || task;
    });
  }, [tasks, state.optimisticTasks]);

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    const currentTask = getOptimisticTask(taskId);
    if (!currentTask) return;

    const updatedTask = { ...currentTask, ...updates };
    
    setState(prev => ({
      ...prev,
      optimisticTasks: new Map(prev.optimisticTasks).set(taskId, updatedTask)
    }));

    // Notify parent component of optimistic update
    if (onTasksUpdate) {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : state.optimisticTasks.get(task.id) || task
      );
      onTasksUpdate(updatedTasks);
    }
  }, [getOptimisticTask, tasks, state.optimisticTasks, onTasksUpdate]);

  // Create drag operation
  const createDragOperation = useCallback((
    task: Task, 
    updates: Partial<Task>, 
    dependentTaskIds: string[] = []
  ): string => {
    const operationId = generateOperationId();
    
    const operation: DragOperation = {
      id: operationId,
      taskId: task.id,
      originalData: task,
      optimisticData: updates,
      dependentOperations: dependentTaskIds,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0
    };

    setState(prev => ({
      ...prev,
      activeOperations: new Map(prev.activeOperations).set(operationId, operation)
    }));

    // Apply optimistic update immediately
    applyOptimisticUpdate(task.id, updates);

    // Set up auto-cleanup timeout
    const timeoutId = setTimeout(() => {
      cleanupOperation(operationId);
    }, 30000); // 30 second timeout
    
    operationTimeoutRef.current.set(operationId, timeoutId);

    return operationId;
  }, [generateOperationId, applyOptimisticUpdate]);

  // Clean up completed operation
  const cleanupOperation = useCallback((operationId: string) => {
    setState(prev => {
      const newOperations = new Map(prev.activeOperations);
      const operation = newOperations.get(operationId);
      
      if (operation && operation.status === 'completed') {
        newOperations.delete(operationId);
        
        // Remove optimistic task if operation completed successfully
        const newOptimisticTasks = new Map(prev.optimisticTasks);
        newOptimisticTasks.delete(operation.taskId);
        
        return {
          ...prev,
          activeOperations: newOperations,
          optimisticTasks: newOptimisticTasks
        };
      }
      
      return prev;
    });

    // Clear timeout
    const timeoutId = operationTimeoutRef.current.get(operationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      operationTimeoutRef.current.delete(operationId);
    }
  }, []);

  // Rollback failed operation
  const rollbackOperation = useCallback((operationId: string) => {
    setState(prev => {
      const operation = prev.activeOperations.get(operationId);
      if (!operation) return prev;

      const newOperations = new Map(prev.activeOperations);
      const newOptimisticTasks = new Map(prev.optimisticTasks);
      
      // Remove optimistic update
      newOptimisticTasks.delete(operation.taskId);
      
      // Mark operation as failed
      newOperations.set(operationId, {
        ...operation,
        status: 'failed'
      });

      return {
        ...prev,
        activeOperations: newOperations,
        optimisticTasks: newOptimisticTasks
      };
    });

    // Update tasks list to reflect rollback
    if (onTasksUpdate) {
      onTasksUpdate(tasks);
    }
  }, [tasks, onTasksUpdate]);

  // Execute operation with retry logic
  const executeOperation = useCallback(async (operationId: string) => {
    const operation = state.activeOperations.get(operationId);
    if (!operation) return;

    // Update operation status to saving
    setState(prev => ({
      ...prev,
      activeOperations: new Map(prev.activeOperations).set(operationId, {
        ...operation,
        status: 'saving'
      }),
      isSaving: true
    }));

    try {
      const { error } = await updateTask(operation.taskId, operation.optimisticData);
      
      if (error) {
        throw new Error(error);
      }

      // Mark operation as completed
      setState(prev => ({
        ...prev,
        activeOperations: new Map(prev.activeOperations).set(operationId, {
          ...operation,
          status: 'completed'
        }),
        isSaving: false
      }));

      toast({
        title: "Task Updated",
        description: `Successfully updated task: ${operation.originalData.title}`,
      });

      // Schedule cleanup
      setTimeout(() => cleanupOperation(operationId), 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle retry logic
      if (operation.retryCount < 2) {
        setState(prev => ({
          ...prev,
          activeOperations: new Map(prev.activeOperations).set(operationId, {
            ...operation,
            retryCount: operation.retryCount + 1,
            status: 'pending'
          })
        }));

        // Retry after delay
        setTimeout(() => executeOperation(operationId), 1000 * (operation.retryCount + 1));
        
        toast({
          title: "Retrying Update",
          description: `Retrying task update (attempt ${operation.retryCount + 2}/3)`,
        });
      } else {
        // Max retries reached, rollback
        setState(prev => ({
          ...prev,
          activeOperations: new Map(prev.activeOperations).set(operationId, {
            ...operation,
            status: 'failed',
            errorMessage
          }),
          isSaving: false
        }));

        rollbackOperation(operationId);
        
        toast({
          title: "Update Failed",
          description: `Failed to update task: ${errorMessage}`,
          variant: "destructive"
        });
      }
    }
  }, [state.activeOperations, updateTask, toast, cleanupOperation, rollbackOperation]);

  // Start bulk operation
  const startBulkOperation = useCallback((primaryTaskId: string, dependentTaskIds: string[]) => {
    setState(prev => ({
      ...prev,
      bulkOperation: {
        primaryTaskId,
        dependentTaskIds,
        coordinatedSave: true,
        operationIds: []
      }
    }));
  }, []);

  // Execute bulk operations
  const executeBulkOperations = useCallback(async () => {
    const { bulkOperation } = state;
    if (!bulkOperation.coordinatedSave || bulkOperation.operationIds.length === 0) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Execute all operations in parallel
      const promises = bulkOperation.operationIds.map(operationId => executeOperation(operationId));
      await Promise.all(promises);

      toast({
        title: "Bulk Update Completed",
        description: `Successfully updated ${bulkOperation.operationIds.length} task(s)`,
      });

    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: "Some updates failed. Individual retry attempts will continue.",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({
        ...prev,
        bulkOperation: {
          primaryTaskId: null,
          dependentTaskIds: [],
          coordinatedSave: false,
          operationIds: []
        },
        isSaving: false
      }));
    }
  }, [state, executeOperation, toast]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    if (state.isSaving) {
      e.preventDefault();
      return;
    }

    setState(prev => ({
      ...prev,
      isDragging: true,
      dragPreview: {
        ...prev.dragPreview,
        task,
        validity: 'valid',
        violationMessages: []
      }
    }));

    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [state.isSaving]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragPreview: {
        task: null,
        position: null,
        previewDate: null,
        validity: 'valid',
        violationMessages: []
      }
    }));
  }, []);

  // Handle drag over with validation
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!state.dragPreview.task || state.isSaving) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    // Calculate preview date based on position
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.floor((relativeX / timelineWidth) * totalDays);
    const previewDate = new Date(timelineStart);
    previewDate.setDate(previewDate.getDate() + daysFromStart);

    setState(prev => ({
      ...prev,
      dragPreview: {
        ...prev.dragPreview,
        position: { x: e.clientX, y: e.clientY },
        previewDate,
        validity: 'valid' // TODO: Add validation logic
      }
    }));
  }, [state.dragPreview.task, state.isSaving, timelineStart, timelineEnd]);

  // Handle drop with optimistic updates
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!state.dragPreview.task || !state.dragPreview.previewDate || state.isSaving) return;

    const task = state.dragPreview.task;
    const newStartDate = state.dragPreview.previewDate;
    
    // Calculate task duration and new end date
    const currentStart = task.start_date ? new Date(task.start_date) : new Date();
    const currentEnd = task.due_date ? new Date(task.due_date) : new Date();
    const duration = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + duration);

    const updates: Partial<Task> = {
      start_date: newStartDate.toISOString(),
      due_date: newEndDate.toISOString()
    };

    // Create and execute operation
    const operationId = createDragOperation(task, updates);
    executeOperation(operationId);

    handleDragEnd();
  }, [state.dragPreview, state.isSaving, createDragOperation, executeOperation, handleDragEnd]);

  // Get operation status for a task
  const getTaskOperationStatus = useCallback((taskId: string) => {
    for (const operation of state.activeOperations.values()) {
      if (operation.taskId === taskId) {
        return operation.status;
      }
    }
    return null;
  }, [state.activeOperations]);

  // Check if any operations are active
  const hasActiveOperations = useMemo(() => {
    return state.activeOperations.size > 0;
  }, [state.activeOperations]);

  return {
    // State
    isDragging: state.isDragging,
    isSaving: state.isSaving,
    hasActiveOperations,
    dragPreview: state.dragPreview,
    
    // Tasks with optimistic updates
    optimisticTasks: getOptimisticTasks,
    
    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    
    // Operation management
    createDragOperation,
    executeOperation,
    rollbackOperation,
    cleanupOperation,
    getTaskOperationStatus,
    
    // Bulk operations
    startBulkOperation,
    executeBulkOperations,
    
    // Utilities
    getOptimisticTask,
    applyOptimisticUpdate
  };
};
