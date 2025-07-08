
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, DollarSign, Shield, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useMaintenanceTasksContext } from '@/contexts/MaintenanceTasksContext';
import { useEquipment } from '@/hooks/useEquipment';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  alertCount?: number;
  onClick: () => void;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, alertCount, onClick }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={12} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={12} className="text-red-500" />;
    return null;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-slate-200 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-sm font-medium text-slate-600">{title}</span>
          </div>
          {alertCount !== undefined && alertCount > 0 && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {alertCount}
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {getTrendIcon()}
        </div>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
};

export const ProjectSummaryBar = () => {
  const [, setSearchParams] = useSearchParams();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { tasks: maintenanceTasks, loading: maintenanceLoading } = useMaintenanceTasksContext();
  const { equipment, loading: equipmentLoading } = useEquipment();

  const metrics = useMemo(() => {
    // Active Projects Count
    const activeProjects = projects.filter(p => 
      p.status !== 'completed' && p.status !== 'cancelled'
    );
    const activeProjectsCount = activeProjects.length;

    // Total Portfolio Value
    const totalPortfolioValue = projects.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0);

    // Overall Safety Score Calculation
    const calculateSafetyScore = () => {
      let baseScore = 100;
      
      // Deduct for critical tasks
      const criticalTasks = tasks.filter(task => task.priority === 'critical' && task.status !== 'completed');
      baseScore -= criticalTasks.length * 5;

      // Deduct for overdue maintenance
      const today = new Date();
      const overdueMaintenance = maintenanceTasks.filter(task => 
        task.scheduled_date && new Date(task.scheduled_date) < today && task.status !== 'completed'
      );
      baseScore -= overdueMaintenance.length * 8;

      // Deduct for equipment issues
      const equipmentIssues = equipment.filter(eq => eq.status === 'maintenance' || eq.status === 'broken');
      baseScore -= equipmentIssues.length * 10;

      return Math.max(0, Math.min(100, baseScore));
    };

    const safetyScore = calculateSafetyScore();

    // Critical Alerts Count
    const criticalTasksCount = tasks.filter(task => 
      task.priority === 'critical' && task.status !== 'completed'
    ).length;

    const overdueMaintenance = maintenanceTasks.filter(task => {
      const today = new Date();
      return task.scheduled_date && new Date(task.scheduled_date) < today && task.status !== 'completed';
    }).length;

    const equipmentAlerts = equipment.filter(eq => 
      eq.status === 'maintenance' || eq.status === 'broken'
    ).length;

    const totalCriticalAlerts = criticalTasksCount + overdueMaintenance + equipmentAlerts;

    return {
      activeProjectsCount,
      totalPortfolioValue,
      safetyScore,
      totalCriticalAlerts,
      criticalTasksCount,
      overdueMaintenance,
      equipmentAlerts
    };
  }, [projects, tasks, maintenanceTasks, equipment]);

  const handleNavigation = (section: string) => {
    setSearchParams({ section });
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const isLoading = projectsLoading || tasksLoading || maintenanceLoading || equipmentLoading;

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjectsCount}
          subtitle={`${projects.length} total projects`}
          icon={Folder}
          color="text-blue-600"
          trend={metrics.activeProjectsCount > 0 ? 'up' : 'stable'}
          onClick={() => handleNavigation('projects')}
        />

        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(metrics.totalPortfolioValue)}
          subtitle="Total budget allocated"
          icon={DollarSign}
          color="text-green-600"
          trend="stable"
          onClick={() => handleNavigation('reports')}
        />

        <MetricCard
          title="Safety Score"
          value={`${metrics.safetyScore}%`}
          subtitle="Overall safety rating"
          icon={Shield}
          color={getSafetyScoreColor(metrics.safetyScore)}
          trend={metrics.safetyScore >= 85 ? 'up' : metrics.safetyScore >= 70 ? 'stable' : 'down'}
          onClick={() => handleNavigation('resources')}
        />

        <MetricCard
          title="Critical Alerts"
          value={metrics.totalCriticalAlerts}
          subtitle={`${metrics.criticalTasksCount} tasks, ${metrics.overdueMaintenance} maintenance, ${metrics.equipmentAlerts} equipment`}
          icon={AlertTriangle}
          color={metrics.totalCriticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}
          alertCount={metrics.totalCriticalAlerts}
          trend={metrics.totalCriticalAlerts > 0 ? 'down' : 'up'}
          onClick={() => handleNavigation('tasks')}
        />
      </div>
    </div>
  );
};
