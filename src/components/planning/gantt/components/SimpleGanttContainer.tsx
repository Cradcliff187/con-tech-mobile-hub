
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useGanttContext } from '@/contexts/gantt/useGanttContext';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttEmptyState } from './GanttEmptyState';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttHeader } from './GanttHeader';
import { GanttTaskList } from './GanttTaskList';
import { VirtualizedTaskList } from './VirtualizedTaskList';
import { GanttTimelineArea } from './GanttTimelineArea';
import { GanttStatusBar } from './GanttStatusBar';
import { DragOverlay } from './DragOverlay';
import { useActionHistory } from '@/hooks/useActionHistory';
import { Task } from '@/types/database';
import { toast } from '@/hooks/use-toast';

interface SimpleGanttContainerProps {
  projectId: string;
  viewMode: 'days' | 'weeks' | 'months';
}

export const SimpleGanttContainer = ({ 
  projectId, 
  viewMode 
}: SimpleGanttContainerProps) => {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [containerHeight, setContainerHeight] = useState(600);
  const [taskPanelWidth, setTaskPanelWidth] = useState(() => {
    const saved = localStorage.getItem('gantt-task-panel-width');
    return saved ? Math.min(400, Math.max(200, parseInt(saved, 10))) : 280;
  });
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for scroll synchronization
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use GanttContext for all state management
  const {
    state,
    selectTask,
    setSaving,
    getFilteredTasks,
    updateTaskOptimistic,
    clearOptimisticUpdate
  } = useGanttContext();

  const { 
    tasks, 
    loading, 
    error, 
    saving, 
    selectedTaskId,
    timelineStart,
    timelineEnd 
  } = state;
  
  // Still need useTasks for direct task updates
  const { updateTask } = useTasks({ projectId });

  // Action history system
  const {
    canUndo,
    canRedo,
    isPerformingAction,
    undo,
    redo,
    clearHistory,
    recordTaskMove,
    getTaskState,
    getUndoDescription,
    getRedoDescription,
    historyLength
  } = useActionHistory({
    tasks,
    onTaskUpdate: updateTask
  });

  // Filter and sort tasks with proper memoization using context
  const displayTasks = useMemo(() => {
    const filteredTasks = getFilteredTasks();
    
    if (!filteredTasks?.length) return [];
    
    return filteredTasks
      .filter(task => task.project_id === projectId)
      .sort((a, b) => {
        // Sort by start date, then by priority
        const aStart = a.start_date ? new Date(a.start_date).getTime() : Date.now();
        const bStart = b.start_date ? new Date(b.start_date).getTime() : Date.now();
        
        if (aStart !== bStart) return aStart - bStart;
        
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        return bPriority - aPriority;
      });
  }, [getFilteredTasks, projectId]);

  // Collapse/expand functionality
  const toggleTaskCollapse = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const collapseAllTasks = () => {
    const allTaskIds = new Set(displayTasks.map(task => task.id));
    setCollapsedTasks(allTaskIds);
  };

  const expandAllTasks = () => {
    setCollapsedTasks(new Set());
  };

  // Debounced scroll synchronization for better performance
  const debouncedSyncContentToHeader = useDebounce(useCallback(() => {
    if (contentScrollRef.current && headerScrollRef.current) {
      contentScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
    }
  }, []), 16); // ~60fps

  const debouncedSyncHeaderToContent = useDebounce(useCallback(() => {
    if (headerScrollRef.current && contentScrollRef.current) {
      headerScrollRef.current.scrollLeft = contentScrollRef.current.scrollLeft;
    }
  }, []), 16); // ~60fps

  // Scroll synchronization effect with debouncing
  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (!headerElement || !contentElement) return;

    headerElement.addEventListener('scroll', debouncedSyncContentToHeader, { passive: true });
    contentElement.addEventListener('scroll', debouncedSyncHeaderToContent, { passive: true });

    return () => {
      headerElement.removeEventListener('scroll', debouncedSyncContentToHeader);
      contentElement.removeEventListener('scroll', debouncedSyncHeaderToContent);
    };
  }, [debouncedSyncContentToHeader, debouncedSyncHeaderToContent]);


  // Panel width persistence
  const updateTaskPanelWidth = useCallback((newWidth: number) => {
    const constrainedWidth = Math.min(400, Math.max(200, newWidth));
    setTaskPanelWidth(constrainedWidth);
    localStorage.setItem('gantt-task-panel-width', constrainedWidth.toString());
  }, []);

  // Resize handle functionality
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = taskPanelWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      updateTaskPanelWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [taskPanelWidth, updateTaskPanelWidth]);

  // Keyboard resize functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.dragState.isDragging) {
        const { cancelDrag } = useGanttContext();
        if (cancelDrag) {
          cancelDrag();
          toast({
            title: "Drag Cancelled",
            description: "Task drag operation was cancelled",
            variant: "default"
          });
        }
      }
      
      // Keyboard resize with Ctrl+Arrow keys
      if (e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const delta = e.key === 'ArrowLeft' ? -20 : 20;
        updateTaskPanelWidth(taskPanelWidth + delta);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.dragState.isDragging, taskPanelWidth, updateTaskPanelWidth]);

  // Measure container height for virtual scrolling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (saving || isPerformingAction) return;
    
    setSaving(true);
    
    try {
      // Get before state for undo
      const beforeState = getTaskState(taskId);
      
      // Validate updates before sending
      if (updates.start_date && updates.due_date) {
        const startDate = new Date(updates.start_date);
        const endDate = new Date(updates.due_date);
        
        if (endDate < startDate) {
          throw new Error('End date cannot be before start date');
        }
        
        if (startDate < timelineStart || endDate > timelineEnd) {
          throw new Error('Task dates are outside the project timeline');
        }
      }
      
      const result = await updateTask(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Record action for undo
      const afterState = { ...beforeState, ...updates };
      recordTaskMove(taskId, beforeState, afterState);
      
      return result;
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    selectTask(selectedTaskId === taskId ? null : taskId);
  };

  // Loading state
  if (loading) {
    return <GanttLoadingState />;
  }

  // Error state with retry
  if (error) {
    return <GanttErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  // Empty state
  if (!displayTasks.length) {
    return <GanttEmptyState projectId={projectId} />;
  }

  const isSystemBusy = saving || isPerformingAction;
  const useVirtualScrolling = displayTasks.length > 50;

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header with undo/redo controls */}
      <GanttHeader
        canUndo={canUndo}
        canRedo={canRedo}
        isPerformingAction={isPerformingAction}
        onUndo={undo}
        onRedo={redo}
        onClearHistory={clearHistory}
        undoDescription={getUndoDescription()}
        redoDescription={getRedoDescription()}
        historyLength={historyLength}
        isSystemBusy={isSystemBusy}
        displayTasks={displayTasks}
        onCollapseAll={collapseAllTasks}
        onExpandAll={expandAllTasks}
      />

      {/* Timeline header with scroll sync */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        tasks={displayTasks}
        scrollRef={headerScrollRef}
      />

      {/* Main content with centralized scroll control */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task list - Use virtual scrolling for large lists */}
        {useVirtualScrolling ? (
          <VirtualizedTaskList
            displayTasks={displayTasks}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
            viewMode={viewMode}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            collapsedTasks={collapsedTasks}
            onToggleCollapse={toggleTaskCollapse}
            height={containerHeight - 160} // Account for headers and status bar
            width={taskPanelWidth}
          />
        ) : (
          <GanttTaskList
            displayTasks={displayTasks}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
            viewMode={viewMode}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            collapsedTasks={collapsedTasks}
            onToggleCollapse={toggleTaskCollapse}
            width={taskPanelWidth}
          />
        )}

        {/* Resize handle */}
        <div
          className={`w-0.5 bg-slate-300 hover:bg-slate-400 cursor-col-resize transition-colors relative z-10 ${
            isResizing ? 'bg-slate-400' : ''
          }`}
          onMouseDown={handleResizeMouseDown}
          role="separator"
          aria-label="Resize task panel"
          aria-valuenow={taskPanelWidth}
          aria-valuemin={200}
          aria-valuemax={400}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' && e.ctrlKey) {
              e.preventDefault();
              updateTaskPanelWidth(taskPanelWidth - 20);
            } else if (e.key === 'ArrowRight' && e.ctrlKey) {
              e.preventDefault();
              updateTaskPanelWidth(taskPanelWidth + 20);
            }
          }}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 hover:bg-slate-400/20" />
        </div>

        {/* Timeline area - Horizontal scroll only with sync */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <GanttTimelineArea
            displayTasks={displayTasks}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
            viewMode={viewMode}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            collapsedTasks={collapsedTasks}
            onToggleCollapse={toggleTaskCollapse}
            scrollRef={contentScrollRef}
          />
        </div>
      </div>
      
      {/* Enhanced status bar */}
      <GanttStatusBar
        displayTasks={displayTasks}
        viewMode={viewMode}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        selectedTaskId={selectedTaskId}
        historyLength={historyLength}
        collapsedTasks={collapsedTasks}
        isSystemBusy={isSystemBusy}
      />
      
      {/* Drag overlay for visual feedback */}
      <DragOverlay
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
      />
    </div>
  );
};
