
import { AlertTriangle, Users, Wrench } from 'lucide-react';
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTimelinePosition, TimelineBounds } from '../utils/overlayUtils';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

interface GanttResourceConflictMarkersProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
}

// Mock resource conflict detection for construction teams
const detectResourceConflicts = (tasks: Task[]) => {
  const conflicts: Array<{
    id: string;
    taskIds: string[];
    type: 'personnel' | 'equipment' | 'skill';
    severity: 'high' | 'medium' | 'low';
    description: string;
    date: Date;
  }> = [];

  // Check for overlapping tasks requiring same skills
  tasks.forEach((task1, i) => {
    tasks.slice(i + 1).forEach(task2 => {
      const { calculatedStartDate: start1, calculatedEndDate: end1 } = calculateTaskDatesFromEstimate(task1);
      const { calculatedStartDate: start2, calculatedEndDate: end2 } = calculateTaskDatesFromEstimate(task2);
      
      // Check for date overlap
      const hasOverlap = start1 <= end2 && start2 <= end1;
      
      if (hasOverlap && task1.required_skills && task2.required_skills) {
        const sharedSkills = task1.required_skills.filter(skill => 
          task2.required_skills?.includes(skill)
        );
        
        if (sharedSkills.length > 0) {
          conflicts.push({
            id: `conflict-${task1.id}-${task2.id}`,
            taskIds: [task1.id, task2.id],
            type: 'skill',
            severity: sharedSkills.length > 1 ? 'high' : 'medium',
            description: `Skill conflict: ${sharedSkills.join(', ')}`,
            date: start1 > start2 ? start1 : start2
          });
        }
      }
      
      // Check for same assignee conflicts
      if (hasOverlap && task1.assignee_id && task2.assignee_id && task1.assignee_id === task2.assignee_id) {
        conflicts.push({
          id: `assignee-conflict-${task1.id}-${task2.id}`,
          taskIds: [task1.id, task2.id],
          type: 'personnel',
          severity: 'high',
          description: 'Same person assigned to overlapping tasks',
          date: start1 > start2 ? start1 : start2
        });
      }
    });
  });

  return conflicts;
};

export const GanttResourceConflictMarkers = ({
  tasks,
  timelineStart,
  timelineEnd
}: GanttResourceConflictMarkersProps) => {
  const conflicts = detectResourceConflicts(tasks);

  const timelineBounds: TimelineBounds = {
    start: timelineStart,
    end: timelineEnd,
    totalDays: Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'personnel': return <Users size={8} className="text-red-600" />;
      case 'equipment': return <Wrench size={8} className="text-orange-600" />;
      case 'skill': return <AlertTriangle size={8} className="text-yellow-600" />;
      default: return <AlertTriangle size={8} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 border-red-600';
      case 'medium': return 'bg-orange-500 border-orange-600';
      case 'low': return 'bg-yellow-500 border-yellow-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const visibleConflicts = conflicts.filter(conflict => {
    return conflict.date >= timelineStart && conflict.date <= timelineEnd;
  });

  if (visibleConflicts.length === 0) return null;

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0">
      {visibleConflicts.map(conflict => {
        const position = calculateTimelinePosition(conflict.date, timelineBounds);
        
        return (
          <Tooltip key={conflict.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute top-8 pointer-events-auto"
                style={{ left: `${position}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(conflict.severity)} flex items-center justify-center shadow-sm border-2 border-white animate-pulse`}>
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
