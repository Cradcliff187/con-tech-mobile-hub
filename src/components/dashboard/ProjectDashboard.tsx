
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// Core Dashboard Components
import { ConsolidatedHealthIndicators } from './ConsolidatedHealthIndicators';
import { InlineWeatherSafety } from './InlineWeatherSafety';
import { CompactActivity } from './CompactActivity';
import { CompactScheduleCard, CompactBudgetCard, CompactResourceCard } from './compact';
import { DetailsSidebar } from './DetailsSidebar';
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
 * ProjectDashboard - Main dashboard component with optimized 75%/25% layout
 * 
 * Layout Structure:
 * 1. Migration Warning (if needed)
 * 2. ProjectSummaryBar - Portfolio-wide metrics and navigation
 * 3. Dashboard Header - Title and Create Project action
 * 4. Optimized Grid - Main content (75%) + Sidebar (25%)
 * 
 * Responsive Design:
 * - Desktop (lg+): 4-column grid (3 main + 1 sidebar)
 * - Tablet (md): 2-column grid
 * - Mobile (sm): 1-column grid
 */
export const ProjectDashboard = () => {
  const { projects, updateProject } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [migrationDismissed, setMigrationDismissed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'resources' | null>(null);

  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null;

  // Handle compact card clicks
  const handleScheduleClick = () => {
    setActiveTab('schedule');
    setSidebarOpen(true);
  };

  const handleBudgetClick = () => {
    setActiveTab('budget');
    setSidebarOpen(true);
  };

  const handleResourceClick = () => {
    setActiveTab('resources');
    setSidebarOpen(true);
  };

  const handleViewAllActivity = () => {
    // Handle view all activity expansion
    console.log('View all activity clicked');
  };

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

      {/* Optimized Grid Layout - 75%/25% split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Consolidated Health Overview */}
          <ConsolidatedHealthIndicators />
          
          {/* Compact Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CompactScheduleCard onClick={handleScheduleClick} />
            <CompactBudgetCard onClick={handleBudgetClick} />
            <CompactResourceCard onClick={handleResourceClick} />
          </div>
          
          {/* Weather and Safety Status */}
          <InlineWeatherSafety />
        </div>
        
        {/* Sidebar Area (1 column) */}
        <div className="lg:col-span-1">
          <CompactActivity onViewAll={handleViewAllActivity} />
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
      />

      {/* Details Sidebar */}
      <DetailsSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
