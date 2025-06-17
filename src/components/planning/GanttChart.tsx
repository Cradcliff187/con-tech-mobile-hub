
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Wrench } from 'lucide-react';
import { Task } from '@/types/database';
import { GanttLoadingState } from './GanttLoadingState';

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
      default: return 'bg-slate-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-600" />;
      case 'high': return <AlertTriangle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  const getConstructionPhaseColor = (task: Task) => {
    // Map task categories to construction phases
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

  const getResourceInfo = (task: Task) => {
    const info = [];
    
    if (task.required_skills && task.required_skills.length > 0) {
      info.push(`Skills: ${task.required_skills.slice(0, 2).join(', ')}${task.required_skills.length > 2 ? '...' : ''}`);
    }
    
    if (task.assignee_id || task.assigned_stakeholder_id) {
      info.push('Assigned');
    }
    
    if (task.estimated_hours) {
      info.push(`${task.estimated_hours}h estimated`);
    }
    
    return info;
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    
    for (let i = 0; i < totalDays; i += 7) {
      headers.push(
        <div key={i} className="text-xs text-slate-600 px-2 py-1 border-r border-slate-200 min-w-[80px]">
          {current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Project Timeline</h3>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{totalDays} days</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{completedTasks} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench size={16} />
            <span>{projectTasks.filter(t => t.task_type === 'punch_list').length} punch list</span>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="flex">
            <div className="w-80 px-4 py-3 border-r border-slate-200 font-medium text-slate-700">
              Task
            </div>
            <div className="flex-1 flex overflow-x-auto">
              {generateTimelineHeaders()}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {projectTasks.map((task, index) => {
            const position = getTaskPosition(task);
            const resourceInfo = getResourceInfo(task);
            
            return (
              <div key={task.id} className={`flex border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                {/* Task Info */}
                <div className="w-80 px-4 py-3 border-r border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityIcon(task.priority)}
                        <h4 className="text-sm font-medium text-slate-800 truncate">
                          {task.title}
                        </h4>
                        {task.task_type === 'punch_list' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Punch List
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>
                          {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'No start'} - {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                        
                        {task.category && (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              {task.category}
                            </span>
                          </div>
                        )}
                        
                        {resourceInfo.length > 0 && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <User size={10} />
                            <span>{resourceInfo[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-600 ml-2">
                      {task.progress || 0}%
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative py-3 px-2">
                  <div className="relative h-6 bg-slate-100 rounded">
                    <div
                      className={`absolute top-0 h-6 rounded shadow-sm ${getConstructionPhaseColor(task)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                      style={{
                        left: `${position.left}%`,
                        width: `${Math.max(2, position.width)}%`
                      }}
                      title={`${task.title} (${task.progress || 0}%) - ${task.category || 'General'}`}
                    >
                      <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                        {task.progress && task.progress > 0 && position.width > 8 && `${task.progress}%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Legend for Construction */}
      <div className="flex items-center gap-6 text-xs text-slate-600 flex-wrap">
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
          <div className="w-3 h-3 bg-slate-400 rounded"></div>
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Punch List</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-600 rounded"></div>
          <span>Foundation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-600 rounded"></div>
          <span>Structure</span>
        </div>
      </div>
    </div>
  );
};
