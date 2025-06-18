import { CheckCircle, Clock, AlertTriangle, Pause, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from './utils/dateUtils';
import { format } from 'date-fns';

interface GanttStatsProps {
  tasks: Task[];
  timelineStart?: Date;
  timelineEnd?: Date;
  onNavigateToDate?: (date: Date) => void;
}

export const GanttStats = ({ tasks, timelineStart, timelineEnd, onNavigateToDate }: GanttStatsProps) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length
  };

  // Calculate task date ranges for navigation
  const taskDates = tasks.flatMap(task => {
    const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    return [calculatedStartDate, calculatedEndDate];
  });

  const earliestTaskDate = taskDates.length > 0 ? new Date(Math.min(...taskDates.map(d => d.getTime()))) : null;
  const latestTaskDate = taskDates.length > 0 ? new Date(Math.max(...taskDates.map(d => d.getTime()))) : null;

  // Count tasks outside current timeline view
  const tasksBeforeTimeline = timelineStart ? tasks.filter(task => {
    const { calculatedEndDate } = calculateTaskDatesFromEstimate(task);
    return calculatedEndDate < timelineStart;
  }).length : 0;

  const tasksAfterTimeline = timelineEnd ? tasks.filter(task => {
    const { calculatedStartDate } = calculateTaskDatesFromEstimate(task);
    return calculatedStartDate > timelineEnd;
  }).length : 0;

  const statCards = [
    { 
      label: 'Total Tasks', 
      value: stats.total, 
      icon: Clock, 
      color: 'text-slate-800',
      bgColor: 'bg-slate-50'
    },
    { 
      label: 'Completed', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      icon: PlayCircle, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Blocked', 
      value: stats.blocked, 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      label: 'Not Started', 
      value: stats.notStarted, 
      icon: Pause, 
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Existing stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`p-3 ${stat.bgColor} border-0`}>
              <div className="flex items-center gap-2">
                <Icon size={16} className={stat.color} />
                <div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task Timeline Summary for Navigation */}
      {(tasksBeforeTimeline > 0 || tasksAfterTimeline > 0) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800">Timeline Summary</span>
            {earliestTaskDate && latestTaskDate && (
              <span className="text-xs text-amber-600">
                {format(earliestTaskDate, 'MMM yyyy')} - {format(latestTaskDate, 'MMM yyyy')}
              </span>
            )}
          </div>
          
          {tasksBeforeTimeline > 0 && earliestTaskDate && (
            <button
              onClick={() => onNavigateToDate?.(earliestTaskDate)}
              className="w-full text-left text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded mb-1 transition-colors flex items-center justify-between"
            >
              <span>
                <span className="font-medium">{tasksBeforeTimeline} tasks</span> before current view
              </span>
              <ChevronLeft size={12} />
            </button>
          )}
          
          {tasksAfterTimeline > 0 && latestTaskDate && (
            <button
              onClick={() => onNavigateToDate?.(latestTaskDate)}
              className="w-full text-left text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors flex items-center justify-between"
            >
              <span>
                <span className="font-medium">{tasksAfterTimeline} tasks</span> after current view
              </span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
