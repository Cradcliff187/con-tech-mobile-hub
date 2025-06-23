
import { User, AlertTriangle, Clock } from 'lucide-react';
import { Task } from '@/types/database';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAssigneeName } from './utils/taskUtils';
import { getCategoryBadgeColor } from './utils/colorUtils';
import { calculateTaskDatesFromEstimate } from './utils/dateUtils';
import { GanttCollapsedTaskCard } from './GanttCollapsedTaskCard';

interface GanttTaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isCollapsed?: boolean;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />;
    case 'high': return <AlertTriangle size={14} className="text-orange-600 flex-shrink-0" />;
    default: return null;
  }
};

const formatCalculatedDateRange = (startDate: Date, endDate: Date, task: Task) => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  // Calculate duration in days
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const durationText = durationDays === 1 ? '1 day' : `${durationDays} days`;
  
  // Show if dates are calculated vs actual
  const hasActualDates = task.start_date && task.due_date;
  const indicator = hasActualDates ? '' : ' (calculated)';
  
  return {
    dateRange: `${start} - ${end}`,
    duration: durationText,
    isCalculated: !hasActualDates,
    indicator
  };
};

export const GanttTaskCard = ({ task, isSelected = false, onSelect, viewMode, isCollapsed = false }: GanttTaskCardProps) => {
  // If collapsed, render the collapsed version
  if (isCollapsed) {
    return (
      <GanttCollapsedTaskCard
        task={task}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }

  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const dateInfo = formatCalculatedDateRange(calculatedStartDate, calculatedEndDate, task);
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(task.id);
    }
  };

  return (
    <div 
      className={`w-80 lg:w-96 border-r border-slate-200 transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-blue-400 bg-blue-50' 
          : 'hover:bg-slate-25'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        {/* Priority + Title */}
        <div className="flex items-start gap-2 mb-2">
          {getPriorityIcon(task.priority)}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold line-clamp-2 leading-tight ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}>
              {task.title}
            </h4>
          </div>
        </div>
        
        {/* Category + Type Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {task.category && (
            <Badge className={`text-xs px-2 py-1 ${getCategoryBadgeColor(task.category)}`}>
              {task.category}
            </Badge>
          )}
          {task.task_type === 'punch_list' && (
            <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
              Punch List
            </Badge>
          )}
        </div>
        
        {/* Assignee + Progress */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate">{getAssigneeName(task)}</span>
          </div>
          <span className={`text-sm font-semibold ${
            isSelected ? 'text-blue-800' : 'text-slate-800'
          }`}>{task.progress || 0}%</span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={task.progress || 0} className="h-1.5 mb-2" />
        
        {/* Enhanced Dates with Duration */}
        <div className="space-y-1 mb-1.5">
          <div className={`text-xs ${dateInfo.isCalculated ? 'text-slate-500' : 'text-slate-700'}`}>
            {dateInfo.dateRange}{dateInfo.indicator}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} className="flex-shrink-0" />
            <span>{dateInfo.duration}</span>
            {task.estimated_hours && (
              <span className="ml-2">• {task.estimated_hours}h estimated</span>
            )}
          </div>
        </div>

        {/* Required Skills */}
        {task.required_skills && task.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.required_skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {task.required_skills.length > 2 && (
              <span className="text-xs text-slate-500">+{task.required_skills.length - 2} more</span>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};
