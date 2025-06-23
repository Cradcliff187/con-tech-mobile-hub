
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
import { MigrationWarning } from '@/components/common/MigrationWarning';
// Hooks
import { useProjects } from '@/hooks/useProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
// UI Components
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// Migration utilities
import { getMigrationStatus, getMigrationWarningMessage, logMigrationStatus } from '@/utils/migration-detection';
import { getLifecycleStatus } from '@/utils/lifecycle-status';

/**
 * ProjectDashboard - Main dashboard component with redesigned layout
 * 
 * Layout Structure:
 * 1. Migration Warning (if needed)
 * 2. ProjectSummaryBar - Portfolio-wide metrics and navigation
 * 3. Dashboard Header - Title and Create Project action
 * 4. Primary Metrics Grid - 6 key dashboard components in responsive grid
 * 5. Recent Activity - Activity feed at bottom
 * 
 * Responsive Design:
 * - Desktop (lg+): 3-column grid
 * - Tablet (md): 2-column grid  
 * - Mobile (sm): 1-column grid
 */
export const ProjectDashboard = () => {
  const { projects, updateProject } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [migrationDismissed, setMigrationDismissed] = useState(false);

  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;

  // Check migration status
  const migrationStatus = getMigrationStatus(projects);
  const migrationWarningMessage = getMigrationWarningMessage(migrationStatus);

  // Log migration status for debugging
  useEffect(() => {
    if (projects.length > 0) {
      logMigrationStatus(projects);
    }
  }, [projects]);

  // Handle mass migration
  const handleMigrateAllProjects = async () => {
    const projectsToMigrate = projects.filter(p => !p.lifecycle_status);
    
    console.log(`🔄 Starting migration of ${projectsToMigrate.length} projects...`);
    
    for (const project of projectsToMigrate) {
      const lifecycleStatus = getLifecycleStatus(project);
      console.log(`Migrating project "${project.name}" to lifecycle_status: ${lifecycleStatus}`);
      
      await updateProject(project.id, {
        lifecycle_status: lifecycleStatus
      });
    }
    
    console.log('✅ Migration completed successfully!');
    setMigrationDismissed(true);
  };

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
      {/* Migration Warning */}
      {migrationStatus.needsMigration && !migrationDismissed && (
        <MigrationWarning
          title="Lifecycle Status Migration Available"
          message={migrationWarningMessage}
          actionLabel="Migrate All Projects"
          onAction={handleMigrateAllProjects}
          type="info"
          dismissible
          onDismiss={() => setMigrationDismissed(true)}
        />
      )}

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
