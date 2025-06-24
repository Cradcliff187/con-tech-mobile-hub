
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTimelineGrid } from '../GanttTimelineGrid';
import { SimpleTaskRow } from './SimpleTaskRow';
import { GanttEmptyState } from './GanttEmptyState';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { GanttUndoRedoControls } from './GanttUndoRedoControls';
import { useTimelineCalculation } from '../hooks/useTimelineCalculation';
import { useActionHistory } from '@/hooks/useActionHistory';
import { Task } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SimpleGanttContainerProps {
  projectId: string;
  viewMode: 'days' | 'weeks' | 'months';
}

export const SimpleGanttContainer = ({ 
  projectId, 
  viewMode 
}: SimpleGanttContainerProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  
  // Refs for scroll synchronization
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  
  const { tasks, loading, error, updateTask } = useTasks({ projectId });
  const { timelineStart, timelineEnd } = useTimelineCalculation(tasks);

  // Action history system
  const {
    canUndo,
    canRedo,
    isPerformingAction,
    undo,
    redo,
    clearHistory,
    recordTaskMove,
    recordTaskUpdate,
    getTaskState,
    getUndoDescription,
    getRedoDescription,
    historyLength
  } = useActionHistory({
    tasks,
    onTaskUpdate: updateTask
  });

  // Filter and sort tasks with proper memoization
  const displayTasks = useMemo(() => {
    if (!tasks?.length) return [];
    
    return tasks
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
  }, [tasks, projectId]);

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
    if (isUpdating || isPerformingAction) return;
    
    setIsUpdating(true);
    
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
      setIsUpdating(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(prev => prev === taskId ? null : taskId);
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

  const isSystemBusy = isUpdating || isPerformingAction;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header with undo/redo controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-slate-700">
            Gantt Chart
          </h3>
          <GanttUndoRedoControls
            canUndo={canUndo}
            canRedo={canRedo}
            isPerformingAction={isPerformingAction}
            onUndo={undo}
            onRedo={redo}
            onClearHistory={clearHistory}
            undoDescription={getUndoDescription()}
            redoDescription={getRedoDescription()}
            historyLength={historyLength}
          />
          
          {/* Collapse/Expand Controls */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsedTasks(new Set(displayTasks.map(task => task.id)))}
              disabled={isSystemBusy}
              className="h-8 px-2 text-xs"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              Collapse All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsedTasks(new Set())}
              disabled={isSystemBusy}
              className="h-8 px-2 text-xs"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand All
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {isSystemBusy && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>
                {isPerformingAction ? 'Processing...' : 'Updating...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline header with scroll sync */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        tasks={displayTasks}
        scrollRef={headerScrollRef}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task list - Fixed width */}
        <div className="w-64 lg:w-72 flex-shrink-0 border-r border-slate-200 bg-white">
          <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3">
            <span className="text-sm font-medium text-slate-700">
              Tasks ({displayTasks.length})
            </span>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {displayTasks.map((task, index) => (
              <div key={task.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <SimpleTaskRow
                  task={task}
                  selectedTaskId={selectedTaskId}
                  onTaskSelect={handleTaskSelect}
                  onTaskUpdate={handleTaskUpdate}
                  viewMode={viewMode}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  isFirstRow={index === 0}
                  timelineOnly={false}
                  isCollapsed={collapsedTasks.has(task.id)}
                  onToggleCollapse={toggleTaskCollapse}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline area - Scrollable with sync */}
        <div 
          ref={contentScrollRef}
          className="flex-1 relative overflow-auto"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin'
          }}
        >
          <GanttTimelineGrid
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
          
          {/* Task bars overlay with header offset */}
          <div className="absolute inset-0 z-10" style={{ top: '32px' }}>
            {displayTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="relative border-b border-slate-200 transition-all duration-200"
                style={{ height: collapsedTasks.has(task.id) ? '32px' : '64px' }}
              >
                <SimpleTaskRow
                  task={task}
                  selectedTaskId={selectedTaskId}
                  onTaskSelect={handleTaskSelect}
                  onTaskUpdate={handleTaskUpdate}
                  viewMode={viewMode}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  isFirstRow={index === 0}
                  timelineOnly={true}
                  isCollapsed={collapsedTasks.has(task.id)}
                  onToggleCollapse={toggleTaskCollapse}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Enhanced status bar */}
      <div className="h-6 bg-slate-50 border-t border-slate-200 flex items-center px-3 text-xs text-slate-600 flex-shrink-0">
        <span>
          {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''} • 
          {viewMode} view • 
          {timelineStart.toLocaleDateString()} - {timelineEnd.toLocaleDateString()}
        </span>
        {selectedTaskId && (
          <span className="ml-4 text-blue-600">
            Task selected: {displayTasks.find(t => t.id === selectedTaskId)?.title}
          </span>
        )}
        {historyLength > 0 && (
          <span className="ml-4 text-slate-500">
            {historyLength} action{historyLength !== 1 ? 's' : ''} in history
          </span>
        )}
        {collapsedTasks.size > 0 && (
          <span className="ml-4 text-slate-500">
            {collapsedTasks.size} task{collapsedTasks.size !== 1 ? 's' : ''} collapsed
          </span>
        )}
        {isSystemBusy && (
          <span className="ml-4 text-orange-600">
            Saving changes...
          </span>
        )}
      </div>
    </div>
  );
};
