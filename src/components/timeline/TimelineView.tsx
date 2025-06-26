import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { ProjectTimeline } from './ProjectTimeline';
import { TaskDetailsModal } from './TaskDetailsModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Task } from '@/types/database';

export const TimelineView = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const loading = tasksLoading || projectsLoading;

  // Calculate real timeline stats from actual data
  const timelineStats = React.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < new Date() && task.status !== 'completed';
    }).length;
    
    // Calculate on-track tasks (not overdue and in progress or completed)
    const onTrackTasks = tasks.filter(task => {
      if (task.status === 'completed') return true;
      if (!task.due_date) return task.status === 'in-progress';
      return new Date(task.due_date) >= new Date() && task.status === 'in-progress';
    }).length;

    // Calculate critical path tasks (high priority tasks)
    const criticalPathTasks = tasks.filter(task => task.priority === 'high').length;

    return {
      totalTasks,
      onTrack: onTrackTasks,
      atRisk: inProgressTasks - onTrackTasks + overdueTasks,
      delayed: overdueTasks,
      criticalPath: criticalPathTasks
    };
  }, [tasks]);

  // Filter active projects with real data
  const activeProjects = React.useMemo(() => {
    return projects
      .filter(project => project.status === 'active')
      .map(project => {
        const projectTasks = tasks.filter(task => task.project_id === project.id);
        const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
        const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
        
        return {
          id: project.id,
          name: project.name,
          progress,
          status: project.status
        };
      });
  }, [projects, tasks]);

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-slate-200 rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timelineStats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{timelineStats.onTrack}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{timelineStats.atRisk}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{timelineStats.delayed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Path</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{timelineStats.criticalPath}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedProjectId === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedProjectId('all')}
        >
          All Projects
        </Button>
        {activeProjects.map((project) => (
          <Button
            key={project.id}
            variant={selectedProjectId === project.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProjectId(project.id)}
            className="flex items-center gap-2"
          >
            {project.name}
            <Badge variant="secondary" className="ml-1">
              {project.progress}%
            </Badge>
          </Button>
        ))}
      </div>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProjectId === 'all' 
              ? 'All Projects Timeline' 
              : activeProjects.find(p => p.id === selectedProjectId)?.name || 'Project Timeline'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTimeline 
            projectId={selectedProjectId === 'all' ? undefined : selectedProjectId}
            onTaskNavigate={handleTaskClick}
            onTaskModal={handleTaskClick}
          />
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  );
};
