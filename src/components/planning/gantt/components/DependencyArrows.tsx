
import React, { useMemo } from 'react';
import { TaskDependency, DependencyVisualization } from '../types/dependencyTypes';
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getTaskGridPosition, getColumnWidth } from '../utils/gridUtils';

interface DependencyArrowsProps {
  dependencies: TaskDependency[];
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  selectedDependency?: string | null;
  onDependencySelect?: (dependencyId: string) => void;
  onDependencyDelete?: (dependencyId: string) => void;
  criticalPath?: string[];
  className?: string;
}

export const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  dependencies,
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  selectedDependency,
  onDependencySelect,
  onDependencyDelete,
  criticalPath = [],
  className = ''
}) => {
  // Calculate arrow paths
  const arrowPaths = useMemo((): DependencyVisualization[] => {
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const columnWidth = getColumnWidth(viewMode);
    
    return dependencies.map(dep => {
      const fromTask = taskMap.get(dep.predecessor_id);
      const toTask = taskMap.get(dep.successor_id);
      
      if (!fromTask || !toTask) {
        return null;
      }

      // Get task positions on timeline
      const fromPosition = getTaskGridPosition(fromTask, timelineStart, timelineEnd, viewMode);
      const toPosition = getTaskGridPosition(toTask, timelineStart, timelineEnd, viewMode);
      
      // Calculate actual pixel positions
      const fromTaskIndex = tasks.findIndex(t => t.id === fromTask.id);
      const toTaskIndex = tasks.findIndex(t => t.id === toTask.id);
      
      const rowHeight = 60; // Match GanttTaskRow height
      const taskBarHeight = 24; // Approximate task bar height
      
      const fromX = (fromPosition.startColumnIndex + fromPosition.columnSpan) * columnWidth;
      const fromY = fromTaskIndex * rowHeight + taskBarHeight / 2;
      
      const toX = toPosition.startColumnIndex * columnWidth;
      const toY = toTaskIndex * rowHeight + taskBarHeight / 2;
      
      // Create arrow path based on dependency type
      const pathData = createArrowPath(fromX, fromY, toX, toY, dep.dependency_type);
      
      return {
        id: dep.id,
        fromTaskId: dep.predecessor_id,
        toTaskId: dep.successor_id,
        type: dep.dependency_type,
        pathData,
        isOnCriticalPath: criticalPath.includes(dep.predecessor_id) && criticalPath.includes(dep.successor_id),
        hasConflict: false // TODO: Implement conflict detection
      };
    }).filter(Boolean) as DependencyVisualization[];
  }, [dependencies, tasks, timelineStart, timelineEnd, viewMode, criticalPath]);

  const handleArrowClick = (dependencyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDependencySelect) {
      onDependencySelect(dependencyId);
    }
  };

  const handleArrowDoubleClick = (dependencyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDependencyDelete) {
      onDependencyDelete(dependencyId);
    }
  };

  if (arrowPaths.length === 0) {
    return null;
  }

  return (
    <svg
      className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}
      style={{ zIndex: 5 }}
    >
      <defs>
        {/* Arrow markers */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="currentColor"
          />
        </marker>
        
        <marker
          id="arrowhead-critical"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#dc2626"
          />
        </marker>
        
        <marker
          id="arrowhead-selected"
          markerWidth="12"
          markerHeight="9"
          refX="11"
          refY="4.5"
          orient="auto"
        >
          <polygon
            points="0 0, 12 4.5, 0 9"
            fill="#f97316"
          />
        </marker>
      </defs>
      
      {arrowPaths.map(arrow => {
        const isSelected = selectedDependency === arrow.id;
        const isCritical = arrow.isOnCriticalPath;
        const hasConflict = arrow.hasConflict;
        
        const strokeColor = isSelected 
          ? '#f97316' // Orange for selected
          : isCritical 
            ? '#dc2626' // Red for critical path
            : hasConflict 
              ? '#f59e0b' // Amber for conflicts
              : '#64748b'; // Slate for normal
              
        const strokeWidth = isSelected ? 3 : isCritical ? 2.5 : 2;
        const markerEnd = isSelected 
          ? 'url(#arrowhead-selected)'
          : isCritical 
            ? 'url(#arrowhead-critical)'
            : 'url(#arrowhead)';

        return (
          <g key={arrow.id}>
            {/* Invisible clickable area */}
            <path
              d={arrow.pathData}
              stroke="transparent"
              strokeWidth="8"
              fill="none"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleArrowClick(arrow.id, e)}
              onDoubleClick={(e) => handleArrowDoubleClick(arrow.id, e)}
            />
            
            {/* Visible arrow */}
            <path
              d={arrow.pathData}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              markerEnd={markerEnd}
              className={`transition-all duration-200 ${
                isSelected ? 'drop-shadow-lg' : ''
              } ${
                isCritical ? 'animate-pulse' : ''
              }`}
              style={{ color: strokeColor }}
            />
            
            {/* Dependency type indicator */}
            {isSelected && (
              <text
                x={arrow.pathData.split(' ')[1]} // Approximate middle X
                y={arrow.pathData.split(' ')[2]} // Approximate middle Y
                textAnchor="middle"
                className="text-xs font-medium fill-orange-600 pointer-events-none"
                dy="-8"
              >
                {arrow.type.replace('-', ' ').toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Helper function to create arrow path based on dependency type
function createArrowPath(
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number, 
  type: string
): string {
  const offsetX = 20; // Horizontal offset for cleaner arrows
  const offsetY = 10; // Vertical offset for task connections
  
  // Adjust connection points based on dependency type
  let startX = fromX;
  let startY = fromY;
  let endX = toX;
  let endY = toY;
  
  switch (type) {
    case 'finish-to-start':
      startX = fromX + 5; // Right edge of predecessor
      endX = toX - 5; // Left edge of successor
      break;
    case 'start-to-start':
      startX = fromX - 5; // Left edge of predecessor
      endX = toX - 5; // Left edge of successor
      break;
    case 'finish-to-finish':
      startX = fromX + 5; // Right edge of predecessor
      endX = toX + 5; // Right edge of successor
      break;
    case 'start-to-finish':
      startX = fromX - 5; // Left edge of predecessor
      endX = toX + 5; // Right edge of successor
      break;
  }
  
  // Create smooth curved path
  const midX = startX + (endX - startX) / 2;
  const controlPointOffset = Math.abs(endY - startY) / 4;
  
  if (Math.abs(endY - startY) < 10) {
    // Horizontal arrow for same-level tasks
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  } else {
    // Curved arrow for different-level tasks
    return `M ${startX} ${startY} 
            C ${startX + offsetX} ${startY}, 
              ${endX - offsetX} ${endY}, 
              ${endX} ${endY}`;
  }
}
