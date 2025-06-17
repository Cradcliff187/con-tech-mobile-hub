
import { Calendar, Flag, AlertTriangle } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getMilestonePosition = (milestoneDate: Date) => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((milestoneDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysFromStart / totalDays) * 100;
  };

  const getMilestoneIcon = (title: string) => {
    if (title.includes('Start')) return <Flag size={12} className="text-green-600" />;
    if (title.includes('Completion')) return <Flag size={12} className="text-blue-600" />;
    if (title.includes('Review') || title.includes('Inspection')) return <AlertTriangle size={12} className="text-orange-600" />;
    return <Calendar size={12} className="text-slate-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-100';
      case 'overdue': return 'border-red-500 bg-red-100';
      case 'in-progress': return 'border-orange-500 bg-orange-100';
      default: return 'border-slate-400 bg-slate-100';
    }
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
      {milestones
        .filter(milestone => {
          const milestoneDate = new Date(milestone.due_date);
          return milestoneDate >= timelineStart && milestoneDate <= timelineEnd;
        })
        .map(milestone => {
          const milestoneDate = new Date(milestone.due_date);
          const position = getMilestonePosition(milestoneDate);
          
          return (
            <Tooltip key={milestone.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-0 bottom-0 pointer-events-auto"
                  style={{ left: `${position}%` }}
                >
                  {/* Milestone line */}
                  <div className="w-0.5 h-full bg-slate-400 opacity-60"></div>
                  
                  {/* Milestone marker */}
                  <div className={`absolute -top-1 -left-3 w-6 h-6 rounded-full border-2 ${getStatusColor(milestone.status)} flex items-center justify-center shadow-sm`}>
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
    </div>
  );
};
