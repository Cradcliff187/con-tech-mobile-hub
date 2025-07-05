import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Calendar, DollarSign, Shield } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { useSafetyMetrics } from '@/hooks/useSafetyMetrics';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface HealthMetric {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

// Calculate budget health based on real metrics
const calculateBudgetHealth = (budgetMetrics: any): number => {
  if (!budgetMetrics) return 75; // Default fallback
  
  const { totalBudget, currentSpend, variance } = budgetMetrics;
  
  if (totalBudget === 0) return 85; // New project default
  
  // Calculate health based on spending efficiency and variance
  const spendingRatio = currentSpend / totalBudget;
  const varianceHealth = variance >= 0 ? 100 : Math.max(60, 100 + (variance / totalBudget) * 100);
  
  // Penalize over-spending, reward under-budget
  let spendingHealth = 100;
  if (spendingRatio > 0.9) {
    spendingHealth = Math.max(60, 100 - (spendingRatio - 0.9) * 500);
  } else if (spendingRatio < 0.8) {
    spendingHealth = Math.min(95, 85 + (0.8 - spendingRatio) * 100);
  }
  
  return Math.round((varianceHealth * 0.6) + (spendingHealth * 0.4));
};

// Calculate safety health based on real metrics
const calculateSafetyHealth = (safetyMetrics: any): number => {
  if (!safetyMetrics) return 85; // Default fallback
  
  const { 
    safetyComplianceRate, 
    daysWithoutIncident, 
    toolboxTalksCompleted, 
    toolboxTalksTotal 
  } = safetyMetrics;
  
  // Base health on compliance rate
  let healthScore = safetyComplianceRate || 85;
  
  // Boost for days without incident
  if (daysWithoutIncident > 30) {
    healthScore = Math.min(100, healthScore + 5);
  } else if (daysWithoutIncident < 7) {
    healthScore = Math.max(60, healthScore - 10);
  }
  
  // Factor in toolbox talks completion
  const toolboxCompletion = toolboxTalksTotal > 0 
    ? (toolboxTalksCompleted / toolboxTalksTotal) * 100 
    : 90;
  
  if (toolboxCompletion < 80) {
    healthScore = Math.max(70, healthScore - 5);
  }
  
  return Math.round(healthScore);
};

// Generate trend based on score
const generateTrend = (score: number): 'up' | 'down' | 'stable' => {
  if (score >= 90) return 'up';
  if (score <= 70) return 'down';
  return 'stable';
};

const MetricItem = ({ metric }: { metric: HealthMetric }) => {
  const IconComponent = metric.icon;
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex-shrink-0">
        <IconComponent size={20} className={metric.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{metric.name}</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-slate-800">{metric.score}%</span>
            <TrendIcon size={12} className={trendColor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConsolidatedHealthIndicators = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { metrics: safetyMetrics, loading: safetyLoading } = useSafetyMetrics();
  const { metrics: budgetMetrics, loading: budgetLoading } = useBudgetTracking();

  const isLoading = projectsLoading || tasksLoading || milestonesLoading || safetyLoading || budgetLoading;

  const healthMetrics = useMemo((): { 
    overallHealth: number; 
    metrics: HealthMetric[];
    error?: string;
  } => {
    try {
      if (projects.length === 0 && !projectsLoading) {
        return {
          overallHealth: 0,
          metrics: [],
          error: 'No projects available'
        };
      }

      // Calculate Schedule Health
      const today = new Date();
      const overdueTasks = tasks.filter(task => 
        task.due_date && new Date(task.due_date) < today && task.status !== 'completed'
      ).length;
      const completedOnTime = tasks.filter(task => 
        task.status === 'completed' && 
        (!task.due_date || new Date(task.due_date) >= today)
      ).length;
      const totalCompletedTasks = tasks.filter(task => task.status === 'completed').length;
      const scheduleHealth = totalCompletedTasks > 0 
        ? Math.max(0, Math.round(((totalCompletedTasks - overdueTasks) / totalCompletedTasks) * 100))
        : 85;

      // Calculate Budget Health using real data
      const budgetHealth = calculateBudgetHealth(budgetMetrics);

      // Calculate Quality Health
      const criticalTasks = tasks.filter(task => task.priority === 'critical').length;
      const completedCriticalTasks = tasks.filter(task => 
        task.priority === 'critical' && task.status === 'completed'
      ).length;
      const qualityHealth = criticalTasks > 0 
        ? Math.round((completedCriticalTasks / criticalTasks) * 100)
        : 90;

      // Calculate Safety Health using real data
      const safetyHealth = calculateSafetyHealth(safetyMetrics);

      // Calculate Overall Health
      const overallHealth = Math.round(
        (scheduleHealth * 0.25) + 
        (budgetHealth * 0.25) + 
        (qualityHealth * 0.25) + 
        (safetyHealth * 0.25)
      );

      const metrics: HealthMetric[] = [
        {
          name: 'Schedule',
          score: scheduleHealth,
          trend: generateTrend(scheduleHealth),
          icon: Calendar,
          color: scheduleHealth >= 85 ? 'text-green-500' : scheduleHealth >= 70 ? 'text-orange-500' : 'text-red-500',
          description: 'Task completion vs timeline'
        },
        {
          name: 'Budget',
          score: budgetHealth,
          trend: generateTrend(budgetHealth),
          icon: DollarSign,
          color: budgetHealth >= 85 ? 'text-green-500' : budgetHealth >= 70 ? 'text-orange-500' : 'text-red-500',
          description: 'Cost vs planned budget'
        },
        {
          name: 'Quality',
          score: qualityHealth,
          trend: generateTrend(qualityHealth),
          icon: CheckCircle,
          color: qualityHealth >= 85 ? 'text-green-500' : qualityHealth >= 70 ? 'text-orange-500' : 'text-red-500',
          description: 'Work quality and standards'
        },
        {
          name: 'Safety',
          score: safetyHealth,
          trend: generateTrend(safetyHealth),
          icon: Shield,
          color: safetyHealth >= 85 ? 'text-green-500' : safetyHealth >= 70 ? 'text-orange-500' : 'text-red-500',
          description: 'Safety compliance and incidents'
        }
      ];

      return { overallHealth, metrics };
    } catch (error) {
      return {
        overallHealth: 0,
        metrics: [],
        error: 'Failed to calculate health metrics'
      };
    }
  }, [projects, tasks, milestones, safetyMetrics, budgetMetrics, projectsLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} />
            Project Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (healthMetrics.error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} />
            Project Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback 
            title="Health Data Unavailable"
            description={healthMetrics.error}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  const getOverallHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { label: 'Good', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const overallStatus = getOverallHealthStatus(healthMetrics.overallHealth);
  const overallTrend = healthMetrics.overallHealth >= 85 ? 'up' : healthMetrics.overallHealth >= 70 ? 'stable' : 'down';
  const TrendIcon = overallTrend === 'up' ? TrendingUp : overallTrend === 'down' ? TrendingDown : Minus;
  const trendColor = overallTrend === 'up' ? 'text-green-500' : overallTrend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} />
            Project Health Overview
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-800">{healthMetrics.overallHealth}%</span>
              <TrendIcon size={16} className={trendColor} />
            </div>
            <Badge 
              className={`${overallStatus.bg} ${overallStatus.color} border-0`}
              variant="secondary"
            >
              {healthMetrics.overallHealth >= 85 ? 
                <CheckCircle size={12} className="mr-1" /> : 
                <AlertTriangle size={12} className="mr-1" />
              }
              {overallStatus.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {healthMetrics.metrics.map((metric) => (
            <MetricItem key={metric.name} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};