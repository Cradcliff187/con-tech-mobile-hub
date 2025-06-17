
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getMarkerPosition, MARKER_ZONES } from '../utils/overlayUtils';

interface GanttCriticalPathOverlayProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

// Simplified critical path calculation for construction projects
const identifyCriticalPath = (tasks: Task[]) => {
  return tasks.filter(task => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    const duration = Math.ceil((calculatedEndDate.getTime() - calculatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      task.priority === 'critical' ||
      (task.category && ['foundation', 'framing', 'electrical', 'plumbing'].includes(task.category.toLowerCase())) ||
      duration <= 1 // Very short tasks are often critical
    );
  });
};

export const GanttCriticalPathOverlay = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode
}: GanttCriticalPathOverlayProps) => {
  const criticalTasks = identifyCriticalPath(tasks);

  const getTaskPosition = (task: Task) => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    
    const startPosition = getMarkerPosition(calculatedStartDate, timelineStart, timelineEnd, viewMode);
    const endPosition = getMarkerPosition(calculatedEndDate, timelineStart, timelineEnd, viewMode);
    
    return { 
      left: startPosition.left, 
      width: Math.max(0.5, endPosition.left - startPosition.left),
      isVisible: startPosition.isVisible || endPosition.isVisible
    };
  };

  // Filter visible critical tasks
  const visibleCriticalTasks = criticalTasks.filter(task => {
    const position = getTaskPosition(task);
    return position.isVisible;
  });

  if (visibleCriticalTasks.length === 0) return null;

  return (
    <div 
      className="absolute top-0 bottom-0 left-0 right-0" 
      style={{ zIndex: MARKER_ZONES.BACKGROUND.zIndex }}
    >
      {/* Critical path background overlay */}
      <div className="absolute inset-0 bg-red-50 opacity-20"></div>
      
      {/* Individual critical task highlights */}
      {visibleCriticalTasks.map(task => {
        const position = getTaskPosition(task);
        
        return (
          <div
            key={`critical-${task.id}`}
            className="absolute top-0 bottom-0 bg-red-200 opacity-30 border-l-2 border-r-2 border-red-400"
            style={{
              left: `${position.left}%`,
              width: `${position.width}%`
            }}
          >
            {/* Critical path indicator line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500"></div>
          </div>
        );
      })}
      
      {/* Critical path legend */}
      <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 shadow-sm border text-xs text-red-700">
        <span className="inline-block w-2 h-2 bg-red-500 rounded mr-1"></span>
        Critical Path ({visibleCriticalTasks.length} tasks)
      </div>
    </div>
  );
};
