
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

interface CriticalPathHighlightProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

// Simplified critical path calculation for construction projects
const identifyCriticalPath = (tasks: Task[]) => {
  // In a real implementation, this would use proper critical path method (CPM)
  // For now, we'll identify critical tasks based on:
  // 1. Critical priority tasks
  // 2. Tasks with no buffer time
  // 3. Dependencies (if we had them)
  
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

export const CriticalPathHighlight = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode
}: CriticalPathHighlightProps) => {
  const criticalTasks = identifyCriticalPath(tasks);

  const getTaskPosition = (task: Task) => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const startDays = Math.ceil((calculatedStartDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDays = Math.ceil((calculatedEndDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (startDays / totalDays) * 100);
    const width = Math.max(0.5, ((endDays - startDays) / totalDays) * 100);
    
    return { left, width };
  };

  if (criticalTasks.length === 0) return null;

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
      {/* Critical path background overlay */}
      <div className="absolute inset-0 bg-red-50 opacity-30"></div>
      
      {/* Individual critical task highlights */}
      {criticalTasks.map(task => {
        const position = getTaskPosition(task);
        
        return (
          <div
            key={`critical-${task.id}`}
            className="absolute top-0 bottom-0 bg-red-200 opacity-40 border-l-2 border-r-2 border-red-400"
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
        Critical Path ({criticalTasks.length} tasks)
      </div>
    </div>
  );
};
