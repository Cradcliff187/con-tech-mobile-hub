
import React, { useState, useMemo } from 'react';
import { ProjectTimeline } from './ProjectTimeline';
import { TaskDetails } from './TaskDetails';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Filter, Download, Calendar } from 'lucide-react';

// CLEANED: Use Supabase hooks for live data now!
export const TimelineView: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Live projects and tasks from Supabase
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Dynamically compute timeline stats
  const timelineStats = useMemo(() => {
    const filteredTasks = selectedProject !== 'all'
      ? tasks.filter(task => task.project_id === selectedProject)
      : tasks;

    const totalTasks = filteredTasks.length;
    let onTrack = 0, atRisk = 0, delayed = 0, criticalPath = 0;

    // Example definitions (customize as needed):
    for (const task of filteredTasks) {
      if (task.status === 'completed') continue;
      // Delayed if due date is past and not completed
      if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
        delayed++;
      }
      // At risk if in-progress and past 80% of estimated hours (if available), or low progress & soon due
      else if (
        (task.progress !== undefined && task.progress < 50 && task.status === 'in-progress') ||
        (task.estimated_hours && task.actual_hours && task.actual_hours > task.estimated_hours * 0.8)
      ) {
        atRisk++;
      }
      // Assume critical path: for now, pretend all "critical" priority tasks not done (you can customize this)
      if (task.priority === 'critical' && task.status !== 'completed') {
        criticalPath++;
      }
      // On track otherwise
      else if (task.status === 'in-progress' || task.status === 'not-started') {
        onTrack++;
      }
    }

    return {
      totalTasks,
      onTrack,
      atRisk,
      delayed,
      criticalPath,
    };
  }, [tasks, selectedProject]);

  // Use projects from Supabase
  const filteredProjects = projects;

  // Find the selected task when user opens the modal
  const selectedTaskObj = tasks.find(task => task.id === selectedTask);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Timeline</h1>
          <p className="text-gray-600 mt-1">Track project progress and task dependencies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{timelineStats.totalTasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-green-600">{timelineStats.onTrack}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">✓</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{timelineStats.atRisk}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">⚠</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-red-600">{timelineStats.delayed}</p>
              </div>
              <Badge className="bg-red-100 text-red-800">⚡</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Path</p>
                <p className="text-2xl font-bold text-purple-600">{timelineStats.criticalPath}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {filteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="structure">Structure</SelectItem>
                    <SelectItem value="mep">MEP</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Component */}
      <ProjectTimeline projectId={selectedProject} />

      {/* Task Details Modal */}
      {selectedTask && selectedTaskObj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Task Details</h2>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
            <TaskDetails taskId={selectedTask} task={selectedTaskObj} />
          </div>
        </div>
      )}
    </div>
  );
};
