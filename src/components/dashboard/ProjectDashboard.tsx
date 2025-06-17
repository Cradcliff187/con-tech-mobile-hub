
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdvancedMetrics } from './AdvancedMetrics';
import { ProjectHealthIndicators } from './ProjectHealthIndicators';
import { QuickStats } from './QuickStats';
import { RecentActivity } from './RecentActivity';
import { WeatherWidget } from './WeatherWidget';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectPhaseManager } from '@/components/planning/ProjectPhaseManager';
import { SystemHealthCheck } from '@/components/debug/SystemHealthCheck';
import { ProjectQuickActions } from '@/components/common/ProjectQuickActions';
import { ProjectEquipmentSection } from './ProjectEquipmentSection';
import { ProjectEquipmentQuickCard } from './ProjectEquipmentQuickCard';
import { useDebugInfo } from '@/hooks/useDebugInfo';
import { useProjects } from '@/hooks/useProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ProjectDashboard = () => {
  const debugInfo = useDebugInfo();
  const { projects } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const isDevelopment = import.meta.env.DEV;

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

  useEffect(() => {
    console.log('=== PROJECT DASHBOARD DEBUG INFO ===');
    console.log('Debug info:', debugInfo);
  }, [debugInfo]);

  return (
    <div className="space-y-6">
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

      {/* System Health Check - Only in Development */}
      {isDevelopment && <SystemHealthCheck />}

      {/* Project Phase Manager - Only shown when a project is selected */}
      {projectId && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Phase Management</h2>
          <ProjectPhaseManager />
        </div>
      )}

      {/* Project Quick Cards - Only shown when a project is selected */}
      {selectedProject && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectEquipmentQuickCard project={selectedProject} />
            {/* Add more quick cards here as needed */}
          </div>
        </div>
      )}

      {/* Project Equipment Section - Only shown when a project is selected */}
      {selectedProject && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Equipment</h2>
          <ProjectEquipmentSection project={selectedProject} />
        </div>
      )}

      {/* Enhanced Metrics Section */}
      <AdvancedMetrics />
      
      {/* Project Health Monitoring */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProjectHealthIndicators />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <QuickStats />
        </div>
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
