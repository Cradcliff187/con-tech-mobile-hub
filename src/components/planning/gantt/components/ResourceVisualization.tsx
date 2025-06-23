
import React, { useMemo } from 'react';
import { Task } from '@/types/database';
import { getTaskGridPosition, getColumnWidth } from '../utils/gridUtils';
import { User, Truck, Wrench } from 'lucide-react';

interface ResourceAllocation {
  id: string;
  taskId: string;
  resourceType: 'personnel' | 'equipment' | 'material';
  resourceName: string;
  allocation: number; // Percentage of resource capacity
  isOverAllocated: boolean;
  color: string;
}

interface ResourceVisualizationProps {
  tasks: Task[];
  resourceAllocations: ResourceAllocation[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  showConflicts?: boolean;
  onResourceClick?: (allocation: ResourceAllocation) => void;
  className?: string;
}

export const ResourceVisualization: React.FC<ResourceVisualizationProps> = ({
  tasks,
  resourceAllocations,
  timelineStart,
  timelineEnd,
  viewMode,
  showConflicts = true,
  onResourceClick,
  className = ''
}) => {
  const columnWidth = getColumnWidth(viewMode);
  
  // Group allocations by task and calculate positions
  const taskResourceBars = useMemo(() => {
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const taskAllocations = new Map<string, ResourceAllocation[]>();
    
    // Group allocations by task
    resourceAllocations.forEach(allocation => {
      const existing = taskAllocations.get(allocation.taskId) || [];
      taskAllocations.set(allocation.taskId, [...existing, allocation]);
    });
    
    // Calculate visual representation for each task
    return Array.from(taskAllocations.entries()).map(([taskId, allocations]) => {
      const task = taskMap.get(taskId);
      if (!task) return null;
      
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      const position = getTaskGridPosition(task, timelineStart, timelineEnd, viewMode);
      
      const rowHeight = 60;
      const taskBarHeight = 24;
      const resourceBarHeight = 4;
      const resourceBarSpacing = 1;
      
      return {
        taskId,
        task,
        taskIndex,
        position,
        allocations,
        x: position.startColumnIndex * columnWidth,
        y: taskIndex * rowHeight + taskBarHeight + 4, // Below main task bar
        width: position.columnSpan * columnWidth,
        totalHeight: allocations.length * (resourceBarHeight + resourceBarSpacing)
      };
    }).filter(Boolean);
  }, [tasks, resourceAllocations, timelineStart, timelineEnd, viewMode, columnWidth]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'personnel':
        return <User size={12} />;
      case 'equipment':
        return <Truck size={12} />;
      case 'material':
        return <Wrench size={12} />;
      default:
        return null;
    }
  };

  const getResourceColor = (allocation: ResourceAllocation) => {
    if (allocation.isOverAllocated) {
      return '#dc2626'; // Red for over-allocation
    }
    
    return allocation.color || '#64748b'; // Use provided color or default slate
  };

  if (taskResourceBars.length === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 3 }}>
      {taskResourceBars.map(taskBar => (
        <div key={taskBar.taskId}>
          {/* Resource allocation bars */}
          {taskBar.allocations.map((allocation, index) => {
            const barY = taskBar.y + index * 5; // 4px height + 1px spacing
            const barWidth = taskBar.width * (allocation.allocation / 100);
            const resourceColor = getResourceColor(allocation);
            
            return (
              <div
                key={allocation.id}
                className="absolute rounded-sm cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-y-150"
                style={{
                  left: `${taskBar.x}px`,
                  top: `${barY}px`,
                  width: `${barWidth}px`,
                  height: '4px',
                  backgroundColor: resourceColor,
                  opacity: allocation.isOverAllocated ? 0.9 : 0.7
                }}
                onClick={() => onResourceClick?.(allocation)}
                title={`${allocation.resourceName} (${allocation.allocation}%)`}
              />
            );
          })}
          
          {/* Resource type indicators */}
          <div 
            className="absolute flex items-center gap-1 pointer-events-auto"
            style={{
              left: `${taskBar.x + taskBar.width + 8}px`,
              top: `${taskBar.y}px`
            }}
          >
            {Array.from(new Set(taskBar.allocations.map(a => a.resourceType))).map(type => (
              <div
                key={type}
                className="flex items-center justify-center w-4 h-4 bg-slate-100 rounded text-slate-600 border border-slate-300"
                title={`${type} allocated`}
              >
                {getResourceIcon(type)}
              </div>
            ))}
          </div>
          
          {/* Over-allocation warning */}
          {showConflicts && taskBar.allocations.some(a => a.isOverAllocated) && (
            <div
              className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse pointer-events-auto cursor-pointer"
              style={{
                left: `${taskBar.x - 8}px`,
                top: `${taskBar.y + taskBar.totalHeight / 2}px`,
                transform: 'translateY(-50%)'
              }}
              title="Resource over-allocation detected"
            />
          )}
        </div>
      ))}
      
      {/* Resource legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-3 pointer-events-auto">
        <div className="text-xs font-medium text-slate-700 mb-2">Resources</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <User size={12} />
            <span>Personnel</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Truck size={12} />
            <span>Equipment</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Wrench size={12} />
            <span>Materials</span>
          </div>
          {showConflicts && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Over-allocated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
