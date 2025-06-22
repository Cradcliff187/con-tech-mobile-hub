
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectHealthIndicators } from './ProjectHealthIndicators';
import { SchedulePerformance } from './SchedulePerformance';
import { SafetyMetrics } from './SafetyMetrics';
import { BudgetTracker } from './BudgetTracker';
import { ResourceUtilization } from './ResourceUtilization';
import { CompactWeatherWidget } from './CompactWeatherWidget';
import { RecentActivity } from './RecentActivity';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectQuickActions } from '@/components/common/ProjectQuickActions';
import { ProjectSummaryBar } from './ProjectSummaryBar';
import { useProjects } from '@/hooks/useProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ProjectDashboard = () => {
  const { projects } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'p',
      ctrlKey: true,
      action: () => setIsCreateProjectOpen(true),
      description: 'Create new project'
    }
  ], true);

  return (
    <div className="space-y-6">
      {/* Project Summary Bar */}
      <ProjectSummaryBar />

      {/* Dashboard Header with Create Project Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">Manage your construction projects</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProject && (
            <ProjectQuickActions 
              project={selectedProject} 
              context="dashboard" 
              variant="compact"
            />
          )}
          <Button 
            onClick={() => setIsCreateProjectOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus size={16} className="mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid - 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectHealthIndicators />
        <SchedulePerformance />
        <SafetyMetrics />
        <BudgetTracker />
        <ResourceUtilization />
        <CompactWeatherWidget />
      </div>
      
      {/* Recent Activity */}
      <RecentActivity />

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
      />

      {/* Floating Quick Actions for selected project */}
      {selectedProject && (
        <ProjectQuickActions 
          project={selectedProject} 
          context="dashboard" 
          variant="floating"
        />
      )}
    </div>
  );
};
