
import React, { useMemo } from 'react';
import { Task } from '@/types/database';
import { getTaskGridPosition, getColumnWidth } from '../utils/gridUtils';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';
import { Flag, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Milestone {
  id: string;
  name: string;
  date: Date;
  status: 'completed' | 'current' | 'upcoming' | 'overdue';
  description?: string;
  linkedTaskIds: string[];
  critical: boolean;
}

interface MilestoneMarkersProps {
  milestones: Milestone[];
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  onMilestoneClick?: (milestone: Milestone) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  className?: string;
}

export const MilestoneMarkers: React.FC<MilestoneMarkersProps> = ({
  milestones,
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  onMilestoneClick,
  onMilestoneEdit,
  className = ''
}) => {
  const columnWidth = getColumnWidth(viewMode);
  
  // Calculate milestone positions on timeline
  const milestonePositions = useMemo(() => {
    return milestones.map(milestone => {
      // Calculate position based on date
      const totalTime = timelineEnd.getTime() - timelineStart.getTime();
      const elapsedTime = milestone.date.getTime() - timelineStart.getTime();
      const positionPercent = Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
      
      // Find linked tasks for vertical positioning
      const linkedTasks = tasks.filter(task => milestone.linkedTaskIds.includes(task.id));
      const taskIndices = linkedTasks.map(task => tasks.findIndex(t => t.id === task.id));
      const avgTaskIndex = taskIndices.length > 0 
        ? taskIndices.reduce((sum, idx) => sum + idx, 0) / taskIndices.length
        : 0;
      
      return {
        ...milestone,
        xPosition: positionPercent,
        yPosition: avgTaskIndex * 60 + 30, // Match task row height
        linkedTasks,
        isVisible: milestone.date >= timelineStart && milestone.date <= timelineEnd
      };
    }).filter(m => m.isVisible);
  }, [milestones, tasks, timelineStart, timelineEnd]);

  const getMilestoneIcon = (status: string, critical: boolean) => {
    const iconProps = { 
      size: 16, 
      className: critical ? 'text-red-600' : 'text-current' 
    };
    
    switch (status) {
      case 'completed':
        return <CheckCircle {...iconProps} className={critical ? 'text-red-600' : 'text-green-600'} />;
      case 'overdue':
        return <AlertCircle {...iconProps} className="text-red-600" />;
      case 'current':
        return <Clock {...iconProps} className={critical ? 'text-red-600' : 'text-blue-600'} />;
      default:
        return <Flag {...iconProps} className={critical ? 'text-red-600' : 'text-slate-600'} />;
    }
  };

  const getMilestoneColor = (status: string, critical: boolean) => {
    if (critical) return 'bg-red-100 border-red-500 text-red-800';
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'overdue':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'current':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-slate-100 border-slate-400 text-slate-700';
    }
  };

  if (milestonePositions.length === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 10 }}>
      {milestonePositions.map(milestone => (
        <div
          key={milestone.id}
          className="absolute pointer-events-auto"
          style={{
            left: `${milestone.xPosition}%`,
            top: `${milestone.yPosition}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Milestone marker */}
          <div
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl ${getMilestoneColor(milestone.status, milestone.critical)}`}
            onClick={() => onMilestoneClick?.(milestone)}
            onDoubleClick={() => onMilestoneEdit?.(milestone)}
          >
            {getMilestoneIcon(milestone.status, milestone.critical)}
            <span className="text-sm font-medium whitespace-nowrap">
              {milestone.name}
            </span>
            
            {milestone.critical && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Critical
              </Badge>
            )}
          </div>
          
          {/* Vertical line connecting to timeline */}
          <div 
            className={`absolute left-1/2 top-full w-0.5 ${
              milestone.critical ? 'bg-red-500' : 'bg-slate-300'
            }`}
            style={{ 
              height: '20px',
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Connection lines to linked tasks */}
          {milestone.linkedTasks.map(task => {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex === -1) return null;
            
            const taskY = taskIndex * 60 + 30;
            const lineHeight = Math.abs(taskY - milestone.yPosition);
            const isAbove = taskY < milestone.yPosition;
            
            return (
              <div
                key={task.id}
                className={`absolute left-1/2 w-0.5 ${
                  milestone.critical ? 'bg-red-300' : 'bg-slate-200'
                } opacity-60`}
                style={{
                  height: `${lineHeight}px`,
                  top: isAbove ? `-${lineHeight}px` : '100%',
                  transform: 'translateX(-50%)'
                }}
              />
            );
          })}
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            <div className="font-medium">{milestone.name}</div>
            <div className="text-slate-300">
              {milestone.date.toLocaleDateString()}
            </div>
            {milestone.description && (
              <div className="text-slate-300 mt-1">
                {milestone.description}
              </div>
            )}
            <div className="text-slate-400 mt-1">
              {milestone.linkedTasks.length} linked tasks
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
