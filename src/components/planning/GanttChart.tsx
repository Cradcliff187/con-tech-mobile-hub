import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { Task } from '@/types/database';
import { GanttLoadingState } from './GanttLoadingState';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GanttTimelineHeader } from './gantt/GanttTimelineHeader';
import { GanttTaskCard } from './gantt/GanttTaskCard';
import { GanttTimelineBar } from './gantt/GanttTimelineBar';
import { GanttLegend } from './gantt/GanttLegend';
import { getDaysBetween } from './gantt/ganttUtils';

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
          <GanttTimelineHeader timelineStart={timelineStart} timelineEnd={timelineEnd} />

          {/* Enhanced Tasks */}
          <div className="max-h-[600px] overflow-y-auto">
            {projectTasks.map((task, index) => (
              <div key={task.id} className={`flex border-b border-slate-200 hover:bg-slate-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <GanttTaskCard task={task} />
                <GanttTimelineBar 
                  task={task} 
                  timelineStart={timelineStart} 
                  timelineEnd={timelineEnd} 
                />
              </div>
            ))}
          </div>
        </Card>

        <GanttLegend />
      </div>
    </TooltipProvider>
  );
};
