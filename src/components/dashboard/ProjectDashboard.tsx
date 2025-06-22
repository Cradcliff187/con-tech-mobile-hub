
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// Core Dashboard Components
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
// Hooks
import { useProjects } from '@/hooks/useProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
// UI Components
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * ProjectDashboard - Main dashboard component with redesigned layout
 * 
 * Layout Structure:
 * 1. ProjectSummaryBar - Portfolio-wide metrics and navigation
 * 2. Dashboard Header - Title and Create Project action
 * 3. Primary Metrics Grid - 6 key dashboard components in responsive grid
 * 4. Recent Activity - Activity feed at bottom
 * 
 * Responsive Design:
 * - Desktop (lg+): 3-column grid
 * - Tablet (md): 2-column grid  
 * - Mobile (sm): 1-column grid
 * 
 * Deprecated Components Removed:
 * - QuickStats (replaced by ProjectSummaryBar)
 * - WeatherWidget (replaced by CompactWeatherWidget)
 * - AdvancedMetrics (integrated into individual components)
 * - Project-specific sections (moved to project detail views)
 */
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
      {/* Portfolio Summary Bar - Key metrics and navigation */}
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

      {/* Primary Metrics Grid - Responsive 3/2/1 column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectHealthIndicators />
        <SchedulePerformance />
        <SafetyMetrics />
        <BudgetTracker />
        <ResourceUtilization />
        <CompactWeatherWidget />
      </div>
      
      {/* Recent Activity Feed */}
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
