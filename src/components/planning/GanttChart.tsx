
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Wrench, PauseCircle, Play } from 'lucide-react';
import { Task } from '@/types/database';
import { GanttLoadingState } from './GanttLoadingState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart = ({ projectId }: GanttChartProps) => {
  const { tasks, loading, error } = useTasks();
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Filter tasks for the selected project
    const filteredTasks = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    if (filteredTasks.length > 0) {
      setProjectTasks(filteredTasks);

      // Calculate timeline bounds using actual task dates
      const tasksWithDates = filteredTasks.filter(task => task.start_date || task.due_date);
      
      if (tasksWithDates.length > 0) {
        const allDates = tasksWithDates.flatMap(task => [
          task.start_date ? new Date(task.start_date) : null,
          task.due_date ? new Date(task.due_date) : null
        ].filter(Boolean) as Date[]);
        
        if (allDates.length > 0) {
          const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
          
          // Add padding
          minDate.setDate(minDate.getDate() - 7);
          maxDate.setDate(maxDate.getDate() + 7);
          
          setTimelineStart(minDate);
          setTimelineEnd(maxDate);
        }
      }
    } else {
      setProjectTasks([]);
    }
  }, [tasks, projectId]);

  const getDaysBetween = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date || task.created_at);
    const taskEnd = new Date(task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const daysFromStart = getDaysBetween(timelineStart, taskStart);
    const taskDuration = getDaysBetween(taskStart, taskEnd);
    
    return {
      left: Math.max(0, (daysFromStart / totalDays) * 100),
      width: Math.min(100, (taskDuration / totalDays) * 100)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'on-hold': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const getConstructionPhaseColor = (task: Task) => {
    const category = task.category?.toLowerCase() || '';
    const taskType = task.task_type || 'regular';
    
    if (taskType === 'punch_list') return 'bg-purple-500';
    
    if (category.includes('foundation')) return 'bg-amber-600';
    if (category.includes('framing') || category.includes('structure')) return 'bg-orange-600';
    if (category.includes('electrical')) return 'bg-yellow-500';
    if (category.includes('plumbing')) return 'bg-blue-600';
    if (category.includes('hvac')) return 'bg-indigo-500';
    if (category.includes('finish') || category.includes('paint')) return 'bg-green-600';
    
    return getStatusColor(task.status);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />;
      case 'high': return <AlertTriangle size={14} className="text-orange-600 flex-shrink-0" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={12} className="text-white" />;
      case 'in-progress': return <Play size={12} className="text-white" />;
      case 'blocked': return <AlertTriangle size={12} className="text-white" />;
      case 'on-hold': return <PauseCircle size={12} className="text-white" />;
      default: return null;
    }
  };

  const getAssigneeName = (task: Task) => {
    if (task.assignee_id) return 'Team Member';
    if (task.assigned_stakeholder_id) return 'Stakeholder';
    return 'Unassigned';
  };

  const getAssigneeInitials = (task: Task) => {
    if (task.assignee_id) return 'TM';
    if (task.assigned_stakeholder_id) return 'ST';
    return '?';
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start';
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
    return `${start} - ${end}`;
  };

  const getCategoryBadgeColor = (category?: string) => {
    if (!category) return 'bg-slate-100 text-slate-700';
    
    const cat = category.toLowerCase();
    if (cat.includes('foundation')) return 'bg-amber-100 text-amber-700';
    if (cat.includes('framing') || cat.includes('structure')) return 'bg-orange-100 text-orange-700';
    if (cat.includes('electrical')) return 'bg-yellow-100 text-yellow-700';
    if (cat.includes('plumbing')) return 'bg-blue-100 text-blue-700';
    if (cat.includes('hvac')) return 'bg-indigo-100 text-indigo-700';
    if (cat.includes('finish') || cat.includes('paint')) return 'bg-green-100 text-green-700';
    
    return 'bg-slate-100 text-slate-700';
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    
    // Show weeks for better granularity
    for (let i = 0; i < totalDays; i += 7) {
      const isToday = new Date().toDateString() === current.toDateString();
      headers.push(
        <div key={i} className={`text-xs px-3 py-2 border-r border-slate-200 min-w-[100px] text-center ${isToday ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-600'}`}>
          <div className="font-medium">{current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div className="text-xs text-slate-400">Week {Math.ceil(i / 7) + 1}</div>
        </div>
      );
      current.setDate(current.getDate() + 7);
    }
    
    return headers;
  };

  // Handle loading state
  if (loading) {
    return <GanttLoadingState />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Error Loading Tasks</h3>
        <p className="text-slate-500">{error.message}</p>
      </div>
    );
  }

  // Handle empty state with construction-specific messaging
  if (projectTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Construction Tasks Found</h3>
        <p className="text-slate-500">
          {projectId && projectId !== 'all' 
            ? 'Add construction tasks to this project to see the project timeline and dependencies.'
            : 'Create a construction project and add tasks to see the Gantt chart timeline.'
          }
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Tasks can include foundations, framing, electrical, plumbing, HVAC, and finishing work.
        </p>
      </div>
    );
  }

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  const totalDays = getDaysBetween(timelineStart, timelineEnd);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Construction Timeline</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-600" />
              <span>{totalDays} days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>{completedTasks} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-purple-600" />
              <span>{projectTasks.filter(t => t.task_type === 'punch_list').length} punch list</span>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 overflow-hidden">
          {/* Enhanced Timeline Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex">
              <div className="w-80 lg:w-96 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-white">
                Task Details
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex min-w-max">
                  {generateTimelineHeaders()}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tasks */}
          <div className="max-h-[600px] overflow-y-auto">
            {projectTasks.map((task, index) => {
              const position = getTaskPosition(task);
              
              return (
                <div key={task.id} className={`flex border-b border-slate-200 hover:bg-slate-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  {/* Enhanced Task Info Panel */}
                  <div className="w-80 lg:w-96 border-r border-slate-200">
                    <CardContent className="p-4">
                      {/* Priority + Title */}
                      <div className="flex items-start gap-2 mb-3">
                        {getPriorityIcon(task.priority)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                            {task.title}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Category + Type Badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
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
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <User size={12} className="flex-shrink-0" />
                          <span className="truncate">{getAssigneeName(task)}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{task.progress || 0}%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <Progress value={task.progress || 0} className="h-2 mb-3" />
                      
                      {/* Dates */}
                      <div className="text-xs text-slate-500 mb-2">
                        {formatDateRange(task.start_date, task.due_date)}
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

                  {/* Enhanced Timeline Bar */}
                  <div className="flex-1 relative py-4 px-2 min-h-[120px]">
                    <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute inset-y-0 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group ${getConstructionPhaseColor(task)}`}
                            style={{
                              left: `${position.left}%`,
                              width: `${Math.max(3, position.width)}%`
                            }}
                          >
                            {/* Progress overlay */}
                            {task.progress && task.progress > 0 && (
                              <div 
                                className="absolute inset-y-0 bg-white bg-opacity-30 rounded-lg transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                            
                            {/* Task content */}
                            <div className="flex items-center justify-between h-full px-2 text-white">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                {getStatusIcon(task.status)}
                                {position.width > 15 && (
                                  <span className="truncate text-xs font-medium">
                                    {task.title}
                                  </span>
                                )}
                              </div>
                              
                              {/* Progress percentage for wider bars */}
                              {position.width > 8 && task.progress && task.progress > 0 && (
                                <span className="text-xs font-bold ml-1">
                                  {task.progress}%
                                </span>
                              )}
                              
                              {/* Assignee indicator for longer bars */}
                              {position.width > 20 && (
                                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full text-xs flex items-center justify-center font-medium ml-1">
                                  {getAssigneeInitials(task)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-semibold">{task.title}</div>
                            <div>Progress: {task.progress || 0}%</div>
                            <div>Status: {task.status}</div>
                            <div>Category: {task.category || 'General'}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Enhanced Construction Legend */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Construction Phases & Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            {/* Status Legend */}
            <div className="space-y-2">
              <div className="font-medium text-slate-600">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>On Hold</span>
              </div>
            </div>

            {/* Phase Legend */}
            <div className="space-y-2">
              <div className="font-medium text-slate-600">Phases</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-600 rounded"></div>
                <span>Foundation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded"></div>
                <span>Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Electrical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Plumbing</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-slate-600">&nbsp;</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                <span>HVAC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Finishing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Punch List</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
