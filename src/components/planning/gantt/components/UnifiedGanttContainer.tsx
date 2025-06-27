
import React, { useState } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { UnifiedTaskBar } from './UnifiedTaskBar';
import { UnifiedTimelineHeader } from './UnifiedTimelineHeader';
import { useTimelineCalculation } from '../hooks/useTimelineCalculation';
import { 
  generateTimelineColumns,
  GRID_CONFIG,
  ROW_CONFIG
} from '../utils/coreGridSystem';

interface UnifiedGanttContainerProps {
  projectId: string;
  viewMode: 'days' | 'weeks' | 'months';
}

export const UnifiedGanttContainer = ({
  projectId,
  viewMode
}: UnifiedGanttContainerProps) => {
  const { tasks, updateTask } = useTasks({ projectId });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const timelineBounds = useTimelineCalculation(tasks, viewMode);
  const timelineColumns = generateTimelineColumns(
    timelineBounds.start,
    timelineBounds.end,
    viewMode
  );

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const result = await updateTask(taskId, updates);
    if (result.error) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header with task list and timeline */}
      <div className="flex border-b border-slate-200">
        {/* Task list header */}
        <div 
          className="w-80 border-r border-slate-200 bg-slate-50 flex items-center px-4" 
          style={{ height: `${ROW_CONFIG.height}px` }}
        >
          <span className="text-sm font-medium text-slate-700">Tasks</span>
        </div>
        
        {/* Timeline header */}
        <div className="flex-1 overflow-x-auto">
          <UnifiedTimelineHeader
            timelineBounds={timelineBounds}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Task rows */}
      <div className="max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex border-b border-slate-100 last:border-b-0">
            {/* Task info column */}
            <div 
              className={`w-80 border-r border-slate-200 px-4 flex items-center cursor-pointer ${
                selectedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
              style={{ height: `${ROW_CONFIG.height}px` }}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {task.title}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {task.category || 'No category'}
                </div>
              </div>
            </div>
            
            {/* Timeline column */}
            <div className="flex-1 overflow-x-auto">
              <div 
                className="relative bg-white"
                style={{ 
                  width: `${timelineBounds.totalWidth}px`, 
                  height: `${ROW_CONFIG.height}px` 
                }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {timelineColumns.map((column) => (
                    <div
                      key={column.key}
                      className="absolute top-0 bottom-0 w-px bg-slate-100"
                      style={{ left: `${column.position}px` }}
                    />
                  ))}
                </div>
                
                {/* Task bar */}
                <UnifiedTaskBar
                  task={task}
                  timelineBounds={timelineBounds}
                  viewMode={viewMode}
                  isSelected={selectedTaskId === task.id}
                  onSelect={setSelectedTaskId}
                  onUpdate={handleTaskUpdate}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tasks.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <div className="text-sm">No tasks found for this project</div>
        </div>
      )}
    </div>
  );
};
