
import { User, AlertTriangle, Clock } from 'lucide-react';
import { Task } from '@/types/database';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAssigneeName } from './utils/taskUtils';
import { getCategoryBadgeColor } from './utils/colorUtils';
import { calculateTaskDatesFromEstimate } from './utils/dateUtils';
import { GanttCollapsedTaskCard } from './GanttCollapsedTaskCard';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface GanttTaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isCollapsed?: boolean;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle size={12} className="text-red-600 flex-shrink-0" />;
    case 'high': return <AlertTriangle size={12} className="text-orange-600 flex-shrink-0" />;
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
  const indicator = hasActualDates ? '' : ' (calc)'; // Shortened indicator
  
  return {
    dateRange: `${start} - ${end}`,
    duration: durationText,
    isCalculated: !hasActualDates,
    indicator
  };
};

export const GanttTaskCard = ({ task, isSelected = false, onSelect, viewMode, isCollapsed = false }: GanttTaskCardProps) => {
  const { updateTask } = useTasks();
  const { toast } = useToast();
  
  console.log('📋 GanttTaskCard: Rendering task', task.title, 'collapsed:', isCollapsed);

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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task.id, { status: newStatus as Task['status'] });
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className={`w-64 lg:w-72 border-r border-slate-200 transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-blue-400 bg-blue-50' 
          : 'hover:bg-slate-25'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-2 py-1.5">
        {/* Priority + Title */}
        <div className="flex items-start gap-1 mb-1">
          {getPriorityIcon(task.priority)}
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-semibold line-clamp-2 leading-tight ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}>
              {task.title}
            </h4>
          </div>
        </div>
        
        {/* Status + Category + Type Badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={task.status}
            onStatusChange={handleStatusChange}
            size="sm"
            showAsDropdown={false}
          />
          {task.category && (
            <Badge className={`text-xs px-1 py-0.5 ${getCategoryBadgeColor(task.category)}`}>
              {task.category}
            </Badge>
          )}
          {task.task_type === 'punch_list' && (
            <Badge className="bg-purple-100 text-purple-700 text-xs px-1 py-0.5">
              Punch
            </Badge>
          )}
        </div>
        
        {/* Assignee + Progress */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <User size={10} className="flex-shrink-0" />
            <span className="truncate text-xs">{getAssigneeName(task)}</span>
          </div>
          <span className={`text-xs font-semibold ${
            isSelected ? 'text-blue-800' : 'text-slate-800'
          }`}>{task.progress || 0}%</span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={task.progress || 0} className="h-1 mb-1" />
        
        {/* Compact Dates with Duration */}
        <div className="space-y-0.5 mb-1">
          <div className={`text-xs ${dateInfo.isCalculated ? 'text-slate-500' : 'text-slate-700'}`}>
            {dateInfo.dateRange}{dateInfo.indicator}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={10} className="flex-shrink-0" />
            <span className="text-xs">{dateInfo.duration}</span>
            {task.estimated_hours && (
              <span className="ml-1 text-xs">• {task.estimated_hours}h</span>
            )}
          </div>
        </div>

        {/* Required Skills - More compact */}
        {task.required_skills && task.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.required_skills.slice(0, 1).map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {task.required_skills.length > 1 && (
              <span className="text-xs text-slate-500">+{task.required_skills.length - 1}</span>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};
