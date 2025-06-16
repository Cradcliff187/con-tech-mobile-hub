
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
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

// CLEANED: Use Supabase hooks for live data now!
export const TimelineView: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state management
  const [filters, setFilters] = useState<TimelineFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  // Live projects and tasks from Supabase
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Filter handlers
  const handleFilterChange = (filterType: keyof TimelineFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Get unique categories and priorities from tasks for filter options
  const { categories, priorities } = useMemo(() => {
    const uniqueCategories = [...new Set(tasks.filter(task => task.category).map(task => task.category))];
    const uniquePriorities = ['low', 'medium', 'high', 'critical'];
    
    return {
      categories: uniqueCategories,
      priorities: uniquePriorities
    };
  }, [tasks]);

  // Dynamically compute timeline stats based on filtered tasks
  const timelineStats = useMemo(() => {
    let filteredTasks = selectedProject !== 'all'
      ? tasks.filter(task => task.project_id === selectedProject)
      : tasks;

    // Apply additional filters
    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    if (filters.category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }
    if (filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    const totalTasks = filteredTasks.length;
    let onTrack = 0, atRisk = 0, delayed = 0, criticalPath = 0;

    for (const task of filteredTasks) {
      if (task.status === 'completed') continue;
      // Delayed if due date is past and not completed (redundant check on status removed)
      if (task.due_date && new Date(task.due_date) < new Date()) {
        delayed++;
      }
      // At risk if in-progress and past 80% of estimated hours (if available), or low progress & soon due
      else if (
        (task.progress !== undefined && task.progress < 50 && task.status === 'in-progress') ||
        (task.estimated_hours && task.actual_hours && task.actual_hours > task.estimated_hours * 0.8)
      ) {
        atRisk++;
      }
      // Assume critical path: for now, all "critical" priority tasks not done
      if (task.priority === 'critical') {
        criticalPath++;
      }
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
  }, [tasks, selectedProject, filters]);

  // Validate projects data before mapping
  const validatedProjects = validateSelectData(projects);

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
                    {projectsLoading ? (
                      <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                    ) : (
                      validatedProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
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
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Component */}
      <ProjectTimeline 
        projectId={selectedProject} 
        filters={filters}
        onTaskSelect={setSelectedTask}
      />

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
