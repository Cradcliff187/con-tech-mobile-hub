
import { useEffect, useState } from 'react';
import { AdvancedMetrics } from './AdvancedMetrics';
import { ProjectHealthIndicators } from './ProjectHealthIndicators';
import { QuickStats } from './QuickStats';
import { RecentActivity } from './RecentActivity';
import { WeatherWidget } from './WeatherWidget';
import { CreateProjectDialog } from './CreateProjectDialog';
import { SystemHealthCheck } from '@/components/debug/SystemHealthCheck';
import { useDebugInfo } from '@/hooks/useDebugInfo';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ProjectDashboard = () => {
  const debugInfo = useDebugInfo();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

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
        <Button 
          onClick={() => setIsCreateProjectOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus size={16} className="mr-2" />
          Create Project
        </Button>
      </div>

      {/* System Health Check */}
      <SystemHealthCheck />

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
    </div>
  );
};
