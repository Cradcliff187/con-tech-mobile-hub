
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { getConstructionPhaseColor } from '../utils/colorUtils';

interface TimelineMiniMapProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  currentViewStart: Date;
  currentViewEnd: Date;
  onViewportChange: (start: Date, end: Date) => void;
}

export const TimelineMiniMap = ({
  tasks,
  timelineStart,
  timelineEnd,
  currentViewStart,
  currentViewEnd,
  onViewportChange
}: TimelineMiniMapProps) => {
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const getTaskMiniPosition = (task: Task) => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    
    const startDays = Math.ceil((calculatedStartDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDays = Math.ceil((calculatedEndDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (startDays / totalDays) * 100);
    const width = Math.max(0.5, ((endDays - startDays) / totalDays) * 100);
    
    return { left, width };
  };

  const getViewportPosition = () => {
    const viewStartDays = Math.ceil((currentViewStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const viewEndDays = Math.ceil((currentViewEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (viewStartDays / totalDays) * 100);
    const width = Math.max(5, ((viewEndDays - viewStartDays) / totalDays) * 100);
    
    return { left, width };
  };

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    
    const clickDate = new Date(timelineStart.getTime() + (clickPercent * (timelineEnd.getTime() - timelineStart.getTime())));
    const viewDuration = currentViewEnd.getTime() - currentViewStart.getTime();
    
    const newStart = new Date(clickDate.getTime() - viewDuration / 2);
    const newEnd = new Date(clickDate.getTime() + viewDuration / 2);
    
    // Ensure we don't go beyond timeline bounds
    if (newStart < timelineStart) {
      onViewportChange(timelineStart, new Date(timelineStart.getTime() + viewDuration));
    } else if (newEnd > timelineEnd) {
      onViewportChange(new Date(timelineEnd.getTime() - viewDuration), timelineEnd);
    } else {
      onViewportChange(newStart, newEnd);
    }
  };

  const viewport = getViewportPosition();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-700">Timeline Overview</h4>
        <div className="text-xs text-slate-500">
          {timelineStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} - {timelineEnd.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
        </div>
      </div>
      
      <div 
        className="relative h-12 bg-white border border-slate-200 rounded cursor-pointer overflow-hidden"
        onClick={handleMiniMapClick}
      >
        {/* Mini task bars */}
        {tasks.map(task => {
          const position = getTaskMiniPosition(task);
          const phaseColor = getConstructionPhaseColor(task);
          
          return (
            <div
              key={`mini-${task.id}`}
              className={`absolute top-1 h-2 ${phaseColor} opacity-70 rounded-sm`}
              style={{
                left: `${position.left}%`,
                width: `${Math.max(1, position.width)}%`
              }}
            />
          );
        })}
        
        {/* Current viewport indicator */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-20 border-l-2 border-r-2 border-blue-500"
          style={{
            left: `${viewport.left}%`,
            width: `${viewport.width}%`
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>
        
        {/* Timeline grid lines */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-slate-300 opacity-50"
            style={{ left: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>Click to navigate</span>
        <span>{tasks.length} tasks</span>
      </div>
    </div>
  );
};
