
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface GanttChartProps {
  projectId: string;
}

interface GanttTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  priority: string;
  dependencies: string[];
  assignee?: string;
}

export const GanttChart = ({ projectId }: GanttChartProps) => {
  const { tasks } = useTasks();
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);

  useEffect(() => {
    // Filter tasks for the selected project
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    
    if (projectTasks.length > 0) {
      // Convert tasks to gantt format
      const convertedTasks: GanttTask[] = projectTasks.map(task => ({
        id: task.id,
        title: task.title,
        startDate: task.start_date || new Date().toISOString().split('T')[0],
        endDate: task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: task.progress || 0,
        status: task.status,
        priority: task.priority,
        dependencies: [], // We'll enhance this with the task_dependencies table later
        assignee: task.assignee_id
      }));

      setGanttTasks(convertedTasks);

      // Calculate timeline bounds
      const allDates = convertedTasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      // Add some padding
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
      
      setTimelineStart(minDate);
      setTimelineEnd(maxDate);
    }
  }, [tasks, projectId]);

  const getDaysBetween = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTaskPosition = (task: GanttTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const daysFromStart = getDaysBetween(timelineStart, taskStart);
    const taskDuration = getDaysBetween(taskStart, taskEnd);
    
    return {
      left: (daysFromStart / totalDays) * 100,
      width: (taskDuration / totalDays) * 100
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

  const generateTimelineHeaders = () => {
    const headers = [];
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    
    for (let i = 0; i < totalDays; i += 7) {
      headers.push(
        <div key={i} className="text-xs text-slate-600 px-2 py-1 border-r border-slate-200">
          {current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      );
      current.setDate(current.getDate() + 7);
    }
    
    return headers;
  };

  if (ganttTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Tasks Found</h3>
        <p className="text-slate-500">Add tasks to this project to see the Gantt chart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Project Timeline</h3>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{getDaysBetween(timelineStart, timelineEnd)} days</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{ganttTasks.filter(t => t.status === 'completed').length} completed</span>
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
          {ganttTasks.map((task, index) => {
            const position = getTaskPosition(task);
            return (
              <div key={task.id} className={`flex border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                {/* Task Info */}
                <div className="w-80 px-4 py-3 border-r border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <h4 className="text-sm font-medium text-slate-800 truncate">
                          {task.title}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 ml-2">
                      {task.progress}%
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative py-3 px-2">
                  <div className="relative h-6 bg-slate-100 rounded">
                    <div
                      className={`absolute top-0 h-6 rounded shadow-sm ${getStatusColor(task.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`
                      }}
                      title={`${task.title} (${task.progress}%)`}
                    >
                      <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                        {task.progress > 0 && `${task.progress}%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-600">
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
      </div>
    </div>
  );
};
