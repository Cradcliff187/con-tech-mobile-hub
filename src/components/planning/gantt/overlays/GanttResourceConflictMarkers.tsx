
import { AlertTriangle, Users, Wrench } from 'lucide-react';
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMarkerPosition, getMarkerVerticalPosition, getMarkerColor } from '../utils/overlayUtils';
import { useResourceConflicts } from '@/hooks/useResourceConflicts';

interface GanttResourceConflictMarkersProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
}

export const GanttResourceConflictMarkers = ({
  tasks,
  timelineStart,
  timelineEnd
}: GanttResourceConflictMarkersProps) => {
  const { conflicts } = useResourceConflicts(tasks);

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'personnel': return <Users size={8} className="text-red-600" />;
      case 'equipment': return <Wrench size={8} className="text-orange-600" />;
      case 'skill': return <AlertTriangle size={8} className="text-yellow-600" />;
      default: return <AlertTriangle size={8} className="text-gray-600" />;
    }
  };

  // Filter visible conflicts using standardized positioning
  const visibleConflicts = conflicts.filter(conflict => {
    const position = getMarkerPosition(conflict.date, timelineStart, timelineEnd);
    return position.isVisible;
  });

  if (visibleConflicts.length === 0) return null;

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0">
      {visibleConflicts.map(conflict => {
        const position = getMarkerPosition(conflict.date, timelineStart, timelineEnd);
        const verticalPos = getMarkerVerticalPosition('conflict');
        const colorClass = getMarkerColor('conflict', conflict.severity);
        
        return (
          <Tooltip key={conflict.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${position.left}%`,
                  top: `${verticalPos.top}px`,
                  zIndex: verticalPos.zIndex
                }}
              >
                <div className={`w-3 h-3 rounded-full ${colorClass} flex items-center justify-center shadow-sm border-2 border-white animate-pulse`}>
                  {getConflictIcon(conflict.type)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs bg-red-50 border-red-200">
              <div className="space-y-1">
                <div className="font-semibold text-red-800 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Resource Conflict
                </div>
                <div className="text-sm text-red-700">{conflict.description}</div>
                <div className="text-xs text-red-600">
                  {conflict.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-red-600">
                  Severity: {conflict.severity}
                </div>
                <div className="text-xs text-red-500 border-t border-red-200 pt-1">
                  Affected tasks: {conflict.taskIds.length}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
