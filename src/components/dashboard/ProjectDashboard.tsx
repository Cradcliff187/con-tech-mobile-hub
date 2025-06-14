
import { useEffect } from 'react';
import { AdvancedMetrics } from './AdvancedMetrics';
import { ProjectHealthIndicators } from './ProjectHealthIndicators';
import { QuickStats } from './QuickStats';
import { RecentActivity } from './RecentActivity';
import { WeatherWidget } from './WeatherWidget';
import { useDebugInfo } from '@/hooks/useDebugInfo';

export const ProjectDashboard = () => {
  const debugInfo = useDebugInfo();

  useEffect(() => {
    console.log('=== PROJECT DASHBOARD DEBUG INFO ===');
    console.log('Debug info:', debugInfo);
  }, [debugInfo]);

  return (
    <div className="space-y-6">
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
    </div>
  );
};
