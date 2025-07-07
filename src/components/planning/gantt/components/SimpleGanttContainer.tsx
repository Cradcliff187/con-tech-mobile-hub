
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGanttContext } from '@/contexts/gantt/useGanttContext';
import { useTasks } from '@/hooks/useTasks';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttEmptyState } from './GanttEmptyState';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttHeader } from './GanttHeader';
import { GanttTaskList } from './GanttTaskList';
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
  
  // Refs for scroll synchronization
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  
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

  // Scroll synchronization effect
  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (!headerElement || !contentElement) return;

    const syncContentToHeader = () => {
      if (contentElement && headerElement) {
        contentElement.scrollLeft = headerElement.scrollLeft;
      }
    };

    const syncHeaderToContent = () => {
      if (headerElement && contentElement) {
        headerElement.scrollLeft = contentElement.scrollLeft;
      }
    };

    headerElement.addEventListener('scroll', syncContentToHeader, { passive: true });
    contentElement.addEventListener('scroll', syncHeaderToContent, { passive: true });

    return () => {
      headerElement.removeEventListener('scroll', syncContentToHeader);
      contentElement.removeEventListener('scroll', syncHeaderToContent);
    };
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

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
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
        {/* Task list - Fixed width, no individual scrolling */}
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
        />

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
