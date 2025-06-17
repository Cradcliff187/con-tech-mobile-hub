
import { useState, useCallback, useMemo } from 'react';
import { Task } from '@/types/database';
import { getDateFromPosition, getTaskDuration, createDragPreview } from './ganttUtils';
import { 
  validateConstructionMove, 
  calculateTaskImpact, 
  getValidDropZones,
  DependencyViolation,
  TaskImpact 
} from './utils/constructionValidation';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDragAndDropState {
  draggedTask: Task | null;
  dragPosition: { x: number; y: number } | null;
  dropPreviewDate: Date | null;
  isDragging: boolean;
  isSaving: boolean;
  localTaskUpdates: Record<string, Partial<Task>>;
  affectedTasks: string[];
  dependencyViolations: DependencyViolation[];
  taskImpacts: TaskImpact[];
  currentValidity: 'valid' | 'warning' | 'invalid';
  validDropZones: Array<{ start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }>;
  showDropZones: boolean;
  violationMessages: string[];
  suggestedDropDate: Date | null;
}

interface UseDragAndDropProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  allTasks?: Task[];
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ data?: any; error?: string }>;
}

export const useDragAndDrop = ({
  timelineStart,
  timelineEnd,
  viewMode,
  allTasks = [],
  updateTask
}: UseDragAndDropProps) => {
  const { toast } = useToast();
  
  const [state, setState] = useState<EnhancedDragAndDropState>({
    draggedTask: null,
    dragPosition: null,
    dropPreviewDate: null,
    isDragging: false,
    isSaving: false,
    localTaskUpdates: {},
    affectedTasks: [],
    dependencyViolations: [],
    taskImpacts: [],
    currentValidity: 'valid',
    validDropZones: [],
    showDropZones: false,
    violationMessages: [],
    suggestedDropDate: null
  });

  // Pre-calculate valid drop zones when drag starts
  const calculateDropZones = useCallback((task: Task) => {
    const zones = getValidDropZones(task, timelineStart, timelineEnd, allTasks);
    return zones;
  }, [timelineStart, timelineEnd, allTasks]);

  // Analyze construction impact in real-time
  const analyzeDropImpact = useCallback((task: Task, newDate: Date) => {
    const violations = validateConstructionMove(task, newDate, allTasks);
    const impacts = calculateTaskImpact(task, newDate, allTasks);
    
    const errorViolations = violations.filter(v => v.severity === 'error');
    const warningViolations = violations.filter(v => v.severity === 'warning');
    
    let validity: 'valid' | 'warning' | 'invalid' = 'valid';
    if (errorViolations.length > 0) validity = 'invalid';
    else if (warningViolations.length > 0) validity = 'warning';
    
    const affectedTaskIds = new Set<string>();
    violations.forEach(v => v.affectedTaskIds.forEach(id => affectedTaskIds.add(id)));
    impacts.forEach(impact => affectedTaskIds.add(impact.taskId));
    
    const violationMessages = violations.map(v => v.message);
    const suggestedDate = violations.find(v => v.suggestedDate)?.suggestedDate || null;
    
    return {
      violations,
      impacts,
      validity,
      affectedTaskIds: Array.from(affectedTaskIds),
      violationMessages,
      suggestedDate
    };
  }, [allTasks]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    // Don't allow drag during save operations
    if (state.isSaving) {
      e.preventDefault();
      return;
    }
    
    const dropZones = calculateDropZones(task);
    
    setState(prev => ({ 
      ...prev, 
      draggedTask: task, 
      isDragging: true,
      validDropZones: dropZones,
      showDropZones: true,
      affectedTasks: [],
      dependencyViolations: [],
      taskImpacts: [],
      currentValidity: 'valid',
      violationMessages: [],
      suggestedDropDate: null
    }));
    
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag preview
    const dragImage = createDragPreview(task);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up drag preview after a short delay
    setTimeout(() => {
      if (dragImage.parentNode) {
        dragImage.parentNode.removeChild(dragImage);
      }
    }, 100);
  }, [calculateDropZones, state.isSaving]);

  const handleDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      draggedTask: null,
      isDragging: false,
      dropPreviewDate: null,
      dragPosition: null,
      showDropZones: false,
      affectedTasks: [],
      dependencyViolations: [],
      taskImpacts: [],
      currentValidity: 'valid',
      violationMessages: [],
      suggestedDropDate: null
    }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!state.draggedTask || state.isSaving) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    const previewDate = getDateFromPosition(
      relativeX,
      timelineWidth,
      timelineStart,
      timelineEnd,
      viewMode
    );
    
    // Real-time impact analysis
    const analysis = analyzeDropImpact(state.draggedTask, previewDate);
    
    setState(prev => ({
      ...prev,
      dropPreviewDate: previewDate,
      dragPosition: { x: e.clientX, y: e.clientY },
      dependencyViolations: analysis.violations,
      taskImpacts: analysis.impacts,
      currentValidity: analysis.validity,
      affectedTasks: analysis.affectedTaskIds,
      violationMessages: analysis.violationMessages,
      suggestedDropDate: analysis.suggestedDate
    }));
  }, [state.draggedTask, state.isSaving, timelineStart, timelineEnd, viewMode, analyzeDropImpact]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!state.draggedTask || state.isSaving) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    const newStartDate = getDateFromPosition(
      relativeX,
      timelineWidth,
      timelineStart,
      timelineEnd,
      viewMode
    );
    
    // Final validation before drop
    const finalAnalysis = analyzeDropImpact(state.draggedTask, newStartDate);
    
    // Allow drops with warnings, but block invalid drops
    if (finalAnalysis.validity === 'invalid') {
      toast({
        title: "Invalid Move",
        description: finalAnalysis.violationMessages.join(', '),
        variant: "destructive"
      });
      handleDragEnd();
      return;
    }
    
    updateTaskDates(state.draggedTask.id, newStartDate, finalAnalysis.impacts);
    
    setState(prev => ({
      ...prev,
      draggedTask: null,
      isDragging: false,
      dropPreviewDate: null,
      dragPosition: null,
      showDropZones: false
    }));
  }, [state.draggedTask, state.isSaving, timelineStart, timelineEnd, viewMode, analyzeDropImpact, toast]);

  const updateTaskDates = useCallback(async (
    taskId: string, 
    newStartDate: Date, 
    impacts: TaskImpact[]
  ) => {
    const task = state.draggedTask;
    if (!task) return;
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    const duration = getTaskDuration(task);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + duration);
    
    const updates: Record<string, Partial<Task>> = {};
    
    // Update the dragged task
    updates[taskId] = {
      start_date: newStartDate.toISOString(),
      due_date: newEndDate.toISOString()
    };
    
    // Update affected dependent tasks
    impacts.forEach(impact => {
      if (impact.taskId !== taskId && impact.impact !== 'unchanged') {
        const affectedTask = allTasks.find(t => t.id === impact.taskId);
        if (affectedTask) {
          const affectedDuration = getTaskDuration(affectedTask);
          const affectedEndDate = new Date(impact.newDate);
          affectedEndDate.setDate(affectedEndDate.getDate() + affectedDuration);
          
          updates[impact.taskId] = {
            start_date: impact.newDate.toISOString(),
            due_date: affectedEndDate.toISOString()
          };
        }
      }
    });
    
    // Apply local updates immediately for UI responsiveness
    setState(prev => ({
      ...prev,
      localTaskUpdates: {
        ...prev.localTaskUpdates,
        ...updates
      }
    }));
    
    // Persist to database
    try {
      const updatePromises = Object.entries(updates).map(async ([id, taskUpdates]) => {
        const { error } = await updateTask(id, taskUpdates);
        if (error) throw new Error(`Failed to update task ${id}: ${error}`);
        return id;
      });
      
      await Promise.all(updatePromises);
      
      // Clear local updates after successful save
      setState(prev => ({ 
        ...prev, 
        localTaskUpdates: {},
        isSaving: false
      }));
      
      toast({
        title: "Tasks Updated",
        description: `Successfully moved ${Object.keys(updates).length} task(s)`,
      });
      
    } catch (error) {
      console.error('Failed to save task updates:', error);
      
      // Rollback local updates on failure
      setState(prev => ({ 
        ...prev, 
        localTaskUpdates: {},
        isSaving: false
      }));
      
      toast({
        title: "Save Failed", 
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  }, [state.draggedTask, allTasks, updateTask, toast]);

  const resetLocalUpdates = useCallback(() => {
    setState(prev => ({ ...prev, localTaskUpdates: {} }));
  }, []);

  const getUpdatedTask = useCallback((task: Task): Task => {
    const updates = state.localTaskUpdates[task.id];
    return updates ? { ...task, ...updates } : task;
  }, [state.localTaskUpdates]);

  // Memoized affected markers for overlay integration
  const affectedMarkerIds = useMemo(() => {
    if (!state.isDragging) return [];
    
    const markerIds = new Set<string>();
    
    // Add dragged task
    if (state.draggedTask) {
      markerIds.add(state.draggedTask.id);
    }
    
    // Add affected tasks
    state.affectedTasks.forEach(id => markerIds.add(id));
    
    return Array.from(markerIds);
  }, [state.isDragging, state.draggedTask, state.affectedTasks]);

  return {
    // Existing state
    ...state,
    
    // Enhanced state for overlay integration
    affectedMarkerIds,
    
    // Existing handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateTaskDates,
    resetLocalUpdates,
    getUpdatedTask,
    
    // New construction-aware handlers
    getDropZoneValidity: (date: Date) => {
      if (!state.draggedTask) return 'valid';
      const analysis = analyzeDropImpact(state.draggedTask, date);
      return analysis.validity;
    },
    
    getViolationsForDate: (date: Date) => {
      if (!state.draggedTask) return [];
      const analysis = analyzeDropImpact(state.draggedTask, date);
      return analysis.violationMessages;
    }
  };
};
