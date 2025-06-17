
import React, { useState, useEffect } from 'react';
import { ProjectTimeline } from './ProjectTimeline';
import { TaskDetails } from './TaskDetails';
import { TimelineHeader } from './TimelineHeader';
import { TimelineStats } from './TimelineStats';
import { TimelineFiltersPanel } from './TimelineFiltersPanel';
import { useTimelineStats } from './hooks/useTimelineStats';
import { useTimelineFilters } from './hooks/useTimelineFilters';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const TimelineView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectFromUrl = searchParams.get('project');
  
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Live projects and tasks from Supabase
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  // Custom hooks for filters and stats
  const { filters, categories, priorities, handleFilterChange } = useTimelineFilters(tasks);
  const timelineStats = useTimelineStats(tasks, selectedProject, filters);

  // Sync URL project parameter with selected project state
  useEffect(() => {
    if (projectFromUrl && projects.length > 0) {
      const projectExists = projects.some(project => project.id === projectFromUrl);
      if (projectExists) {
        setSelectedProject(projectFromUrl);
      } else {
        setSelectedProject('all');
      }
    } else if (!projectFromUrl) {
      setSelectedProject('all');
    }
  }, [projectFromUrl, projects]);

  // Navigation handler for task clicks
  const handleTaskNavigation = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const projectId = task?.project_id || selectedProject;
    
    // Navigate to TaskManager with task and project context
    if (projectId && projectId !== 'all') {
      navigate(`/?section=tasks&project=${projectId}&task=${taskId}`);
    } else {
      navigate(`/?section=tasks&task=${taskId}`);
    }
  };

  // Modal handler for task details (secondary option)
  const handleTaskModal = (taskId: string) => {
    setSelectedTask(taskId);
  };

  // Find the selected task when user opens the modal
  const selectedTaskObj = tasks.find(task => task.id === selectedTask);

  const loading = projectsLoading || tasksLoading;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <TimelineHeader 
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Stats Overview */}
      <TimelineStats stats={timelineStats} />

      {/* Filters Panel */}
      {showFilters && (
        <TimelineFiltersPanel
          selectedProject={selectedProject}
          filters={filters}
          projects={projects}
          projectsLoading={projectsLoading}
          categories={categories}
          priorities={priorities}
          onProjectChange={setSelectedProject}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Timeline Component */}
      <ProjectTimeline 
        projectId={selectedProject} 
        filters={filters}
        onTaskNavigate={handleTaskNavigation}
        onTaskModal={handleTaskModal}
        loading={loading}
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
