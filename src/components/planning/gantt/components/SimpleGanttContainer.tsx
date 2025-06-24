
import React, { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { GanttTimelineGrid } from '../GanttTimelineGrid';
import { SimpleTaskRow } from './SimpleTaskRow';
import { GanttEmptyState } from '../GanttEmptyState';
import { GanttLoadingState } from './GanttLoadingState';
import { GanttErrorState } from './GanttErrorState';
import { useTimelineCalculation } from '../hooks/useTimelineCalculation';
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { tasks, loading, error, updateTask } = useTasks({ projectId });
  const { timelineStart, timelineEnd } = useTimelineCalculation(tasks, viewMode);

  // Filter and sort tasks
  const displayTasks = useMemo(() => {
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

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    setIsUpdating(true);
    
    try {
      const result = await updateTask(taskId, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update task:', error);
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

  // Error state
  if (error) {
    return <GanttErrorState error={error} />;
  }

  // Empty state
  if (displayTasks.length === 0) {
    return <GanttEmptyState projectId={projectId} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        tasks={displayTasks}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task list - Fixed width */}
        <div className="w-64 lg:w-72 flex-shrink-0 border-r border-slate-200 bg-white">
          <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3">
            <span className="text-sm font-medium text-slate-700">
              Tasks ({displayTasks.length})
            </span>
            {isUpdating && (
              <div className="ml-2 w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          
          <div className="overflow-y-auto">
            {displayTasks.map((task, index) => (
              <SimpleTaskRow
                key={task.id}
                task={task}
                selectedTaskId={selectedTaskId}
                onTaskSelect={handleTaskSelect}
                onTaskUpdate={handleTaskUpdate}
                viewMode={viewMode}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                isFirstRow={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Timeline area - Scrollable */}
        <div className="flex-1 relative overflow-auto">
          <GanttTimelineGrid
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
          />
          
          {/* Task bars overlay */}
          <div className="absolute inset-0">
            {displayTasks.map((task, index) => (
              <div key={task.id} className="relative">
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
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="h-6 bg-slate-50 border-t border-slate-200 flex items-center px-3 text-xs text-slate-600">
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
      </div>
    </div>
  );
};
