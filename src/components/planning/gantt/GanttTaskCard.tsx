
import { User, AlertTriangle, Clock } from 'lucide-react';
import { Task } from '@/types/database';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAssigneeName } from './utils/taskUtils';
import { calculateTaskDatesFromEstimate } from './utils/dateUtils';
import { GanttCollapsedTaskCard } from './GanttCollapsedTaskCard';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useGanttContext } from '@/contexts/gantt';

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

const getCategoryBadgeColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'foundation': return 'bg-stone-100 text-stone-800';
    case 'framing': return 'bg-amber-100 text-amber-800';
    case 'electrical': return 'bg-yellow-100 text-yellow-800';
    case 'plumbing': return 'bg-blue-100 text-blue-800';
    case 'hvac': return 'bg-cyan-100 text-cyan-800';
    case 'roofing': return 'bg-slate-100 text-slate-800';
    case 'flooring': return 'bg-orange-100 text-orange-800';
    case 'painting': return 'bg-purple-100 text-purple-800';
    case 'inspection': return 'bg-green-100 text-green-800';
    case 'cleanup': return 'bg-gray-100 text-gray-800';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const formatCalculatedDateRange = (startDate: Date, endDate: Date, task: Task) => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const durationText = durationDays === 1 ? '1 day' : `${durationDays} days`;
  
  const hasActualDates = task.start_date && task.due_date;
  const indicator = hasActualDates ? '' : ' (calc)';
  
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
  const { getDisplayTask } = useGanttContext();
  
  const displayTask = getDisplayTask ? getDisplayTask(task.id) || task : task;

  if (isCollapsed) {
    return (
      <GanttCollapsedTaskCard
        task={displayTask}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }

  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(displayTask);
  const dateInfo = formatCalculatedDateRange(calculatedStartDate, calculatedEndDate, displayTask);
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(displayTask.id);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(displayTask.id, { status: newStatus as Task['status'] });
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
      } ${
        displayTask !== task ? 'bg-blue-25 border-l-2 border-l-blue-400' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-2 py-1.5">
        {/* Priority + Title */}
        <div className="flex items-start gap-1 mb-1">
          {getPriorityIcon(displayTask.priority)}
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-semibold line-clamp-2 leading-tight ${
              isSelected ? 'text-blue-800' : 'text-slate-800'
            }`}>
              {displayTask.title}
            </h4>
          </div>
        </div>
        
        {/* Status + Category + Type Badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={displayTask.status}
            onStatusChange={handleStatusChange}
            size="sm"
            showAsDropdown={false}
          />
          {displayTask.category && (
            <Badge className={`text-xs px-1 py-0.5 ${getCategoryBadgeColor(displayTask.category)}`}>
              {displayTask.category}
            </Badge>
          )}
          {displayTask.task_type === 'punch_list' && (
            <Badge className="bg-purple-100 text-purple-700 text-xs px-1 py-0.5">
              Punch
            </Badge>
          )}
        </div>
        
        {/* Assignee + Progress */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <User size={10} className="flex-shrink-0" />
            <span className="truncate text-xs">{getAssigneeName(displayTask)}</span>
          </div>
          <span className={`text-xs font-semibold ${
            isSelected ? 'text-blue-800' : 'text-slate-800'
          }`}>{displayTask.progress || 0}%</span>
        </div>
        
        <Progress value={displayTask.progress || 0} className="h-1 mb-1" />
        
        {/* Dates with Duration */}
        <div className="space-y-0.5 mb-1">
          <div className={`text-xs ${dateInfo.isCalculated ? 'text-slate-500' : 'text-slate-700'}`}>
            {dateInfo.dateRange}{dateInfo.indicator}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={10} className="flex-shrink-0" />
            <span className="text-xs">{dateInfo.duration}</span>
            {displayTask.estimated_hours && (
              <span className="ml-1 text-xs">• {displayTask.estimated_hours}h</span>
            )}
          </div>
        </div>

        {/* Required Skills */}
        {displayTask.required_skills && displayTask.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTask.required_skills.slice(0, 1).map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {displayTask.required_skills.length > 1 && (
              <span className="text-xs text-slate-500">+{displayTask.required_skills.length - 1}</span>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};
