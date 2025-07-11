
import { Calendar, Flag, AlertTriangle } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMarkerPosition, getMarkerVerticalPosition, MARKER_ZONES } from '../utils/overlayUtils';

interface GanttMilestoneMarkersProps {
  projectId: string;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttMilestoneMarkers = ({
  projectId,
  timelineStart,
  timelineEnd,
  viewMode
}: GanttMilestoneMarkersProps) => {
  const { milestones } = useMilestones(projectId);

  const getMilestoneIcon = (title: string) => {
    if (title.includes('Start')) return <Flag size={10} className="text-green-600" />;
    if (title.includes('Completion')) return <Flag size={10} className="text-blue-600" />;
    if (title.includes('Review') || title.includes('Inspection')) return <AlertTriangle size={10} className="text-orange-600" />;
    return <Calendar size={10} className="text-slate-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-100';
      case 'overdue': return 'border-red-500 bg-red-100';
      case 'in-progress': return 'border-orange-500 bg-orange-100';
      default: return 'border-slate-400 bg-slate-100';
    }
  };

  // Filter visible milestones using standardized positioning
  const visibleMilestones = milestones.filter(milestone => {
    const milestoneDate = new Date(milestone.due_date);
    const position = getMarkerPosition(milestoneDate, timelineStart, timelineEnd, viewMode);
    return position.isVisible;
  });

  return (
    <>
      {visibleMilestones.map(milestone => {
        const milestoneDate = new Date(milestone.due_date);
        const position = getMarkerPosition(milestoneDate, timelineStart, timelineEnd, viewMode);
        const verticalPos = getMarkerVerticalPosition('milestone');
        
        return (
          <Tooltip key={milestone.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${position.left}%`,
                  top: `${verticalPos.top}px`,
                  zIndex: verticalPos.zIndex
                }}
              >
                {/* Milestone line */}
                <div className="w-0.5 h-full bg-slate-400 opacity-60 absolute" style={{ height: '100vh' }}></div>
                
                {/* Milestone marker */}
                <div className={`relative -left-3 w-6 h-6 rounded-full border-2 ${getStatusColor(milestone.status)} flex items-center justify-center shadow-sm`}>
                  {getMilestoneIcon(milestone.title)}
                </div>
                
                {/* Milestone label for larger view modes */}
                {viewMode !== 'days' && (
                  <div className="absolute -top-8 -left-12 w-24 text-xs text-center text-slate-600 font-medium bg-white rounded px-1 py-0.5 shadow-sm border">
                    {milestone.title.split(' - ')[1] || milestone.title}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-800">{milestone.title}</div>
                <div className="text-sm text-slate-600">
                  {milestoneDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'overdue' ? 'bg-red-500' :
                    milestone.status === 'in-progress' ? 'bg-orange-500' : 'bg-slate-400'
                  }`}></span>
                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                </div>
                {milestone.description && (
                  <div className="text-xs text-slate-500 border-t pt-1">
                    {milestone.description}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
};
