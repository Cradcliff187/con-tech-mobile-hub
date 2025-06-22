
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Calendar, DollarSign, Shield, Wrench } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { useSafetyMetrics } from '@/hooks/useSafetyMetrics';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { CircularProgressSkeleton } from './skeletons/CircularProgressSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface HealthMetric {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  trend: 'up' | 'down' | 'stable';
}

const CircularProgress = ({ 
  percentage, 
  size = 80, 
  strokeWidth = 6, 
  color,
  label,
  trend 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${color}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-800">{percentage}%</span>
          <TrendIcon size={12} className={trendColor} />
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 text-center">{label}</span>
    </div>
  );
};

const PhaseIndicator = ({ currentPhase }: { currentPhase: string }) => {
  const phases = [
    { name: 'Planning', key: 'planning' },
    { name: 'Active', key: 'active' },
    { name: 'Punch List', key: 'punch_list' },
    { name: 'Closeout', key: 'closeout' },
    { name: 'Completed', key: 'completed' }
  ];

  const currentIndex = phases.findIndex(phase => phase.key === currentPhase);

  return (
    <div className="flex items-center justify-between w-full">
      {phases.map((phase, index) => (
        <React.Fragment key={phase.key}>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${
              index <= currentIndex 
                ? 'bg-blue-600' 
                : 'bg-slate-200'
            }`} />
            <span className={`text-xs mt-1 ${
              index === currentIndex 
                ? 'text-blue-600 font-medium' 
                : 'text-slate-500'
            }`}>
              {phase.name}
            </span>
          </div>
          {index < phases.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${
              index < currentIndex 
                ? 'bg-blue-600' 
                : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

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

export const ProjectHealthIndicators = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { metrics: safetyMetrics, loading: safetyLoading } = useSafetyMetrics();
  const { metrics: budgetMetrics, loading: budgetLoading } = useBudgetTracking();

  const isLoading = projectsLoading || tasksLoading || milestonesLoading || safetyLoading || budgetLoading;

  const healthMetrics = useMemo((): { 
    overallHealth: number; 
    metrics: HealthMetric[];
    phaseDistribution: Record<string, number>;
    error?: string;
  } => {
    try {
      if (projects.length === 0 && !projectsLoading) {
        return {
          overallHealth: 0,
          metrics: [],
          phaseDistribution: {},
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
          color: scheduleHealth >= 85 ? 'stroke-green-500' : scheduleHealth >= 70 ? 'stroke-orange-500' : 'stroke-red-500',
          description: 'Task completion vs timeline'
        },
        {
          name: 'Budget',
          score: budgetHealth,
          trend: generateTrend(budgetHealth),
          icon: DollarSign,
          color: budgetHealth >= 85 ? 'stroke-green-500' : budgetHealth >= 70 ? 'stroke-orange-500' : 'stroke-red-500',
          description: 'Cost vs planned budget'
        },
        {
          name: 'Quality',
          score: qualityHealth,
          trend: generateTrend(qualityHealth),
          icon: CheckCircle,
          color: qualityHealth >= 85 ? 'stroke-green-500' : qualityHealth >= 70 ? 'stroke-orange-500' : 'stroke-red-500',
          description: 'Work quality and standards'
        },
        {
          name: 'Safety',
          score: safetyHealth,
          trend: generateTrend(safetyHealth),
          icon: Shield,
          color: safetyHealth >= 85 ? 'stroke-green-500' : safetyHealth >= 70 ? 'stroke-orange-500' : 'stroke-red-500',
          description: 'Safety compliance and incidents'
        }
      ];

      // Calculate phase distribution
      const phaseDistribution = projects.reduce((acc, project) => {
        const phase = project.phase || 'planning';
        acc[phase] = (acc[phase] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { overallHealth, metrics, phaseDistribution };
    } catch (error) {
      console.error('Error calculating health metrics:', error);
      return {
        overallHealth: 0,
        metrics: [],
        phaseDistribution: {},
        error: 'Failed to calculate health metrics'
      };
    }
  }, [projects, tasks, milestones, safetyMetrics, budgetMetrics, projectsLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <CircularProgressSkeleton size={120} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <CircularProgressSkeleton key={i} size={80} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (healthMetrics.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp size={20} />
            Project Health
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

  const getOverallHealthColor = (score: number) => {
    if (score >= 85) return 'stroke-green-500';
    if (score >= 70) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const getOverallHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { label: 'Good', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const overallStatus = getOverallHealthStatus(healthMetrics.overallHealth);
  const mostCommonPhase = Object.entries(healthMetrics.phaseDistribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'planning';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <TrendingUp size={20} />
          Project Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Health Score */}
          <div className="text-center">
            <CircularProgress
              percentage={healthMetrics.overallHealth}
              size={120}
              strokeWidth={8}
              color={getOverallHealthColor(healthMetrics.overallHealth)}
              label="Overall Health"
              trend={healthMetrics.overallHealth >= 85 ? 'up' : healthMetrics.overallHealth >= 70 ? 'stable' : 'down'}
            />
            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-medium ${overallStatus.bg} ${overallStatus.color}`}>
              {healthMetrics.overallHealth >= 85 ? 
                <CheckCircle size={14} /> : 
                <AlertTriangle size={14} />
              }
              {overallStatus.label}
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthMetrics.metrics.map((metric) => (
              <div key={metric.name} className="text-center">
                <CircularProgress
                  percentage={metric.score}
                  size={80}
                  strokeWidth={6}
                  color={metric.color}
                  label={metric.name}
                  trend={metric.trend}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          {/* Phase Indicator */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-600">Current Phase Distribution</h4>
            <PhaseIndicator currentPhase={mostCommonPhase} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
              <div className="text-sm text-slate-500">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {tasks.filter(task => task.status === 'completed').length}
              </div>
              <div className="text-sm text-slate-500">Tasks Completed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
