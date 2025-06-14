
import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Users } from 'lucide-react';

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  overdueTasks: number;
  criticalTasks: number;
  resourceUtilization: number;
}

export const AdvancedMetrics = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    averageProgress: 0,
    overdueTasks: 0,
    criticalTasks: 0,
    resourceUtilization: 0
  });

  useEffect(() => {
    if (projects.length === 0) return;

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const averageProgress = Math.round(
      projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
    );

    // Task analytics
    const today = new Date();
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < today && t.status !== 'completed'
    ).length;
    
    const criticalTasks = tasks.filter(t => t.priority === 'critical').length;

    // Mock resource utilization for demo
    const resourceUtilization = Math.round(Math.random() * 20 + 75); // 75-95%

    setMetrics({
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      averageProgress,
      overdueTasks,
      criticalTasks,
      resourceUtilization
    });
  }, [projects, tasks]);

  const budgetUtilization = metrics.totalBudget > 0 ? (metrics.totalSpent / metrics.totalBudget) * 100 : 0;
  const projectCompletionRate = metrics.totalProjects > 0 ? (metrics.completedProjects / metrics.totalProjects) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeProjects} active, {metrics.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics.totalBudget / 1000000).toFixed(1)}M</div>
            <div className="mt-2">
              <Progress value={budgetUtilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUtilization.toFixed(1)}% utilized
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageProgress}%</div>
            <div className="mt-2">
              <Progress value={metrics.averageProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Across all projects
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resourceUtilization}%</div>
            <div className="mt-2">
              <Progress value={metrics.resourceUtilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Team capacity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Overdue Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{metrics.overdueTasks}</div>
            <p className="text-xs text-orange-600">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Critical Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{metrics.criticalTasks}</div>
            <p className="text-xs text-red-600">High priority items</p>
          </CardContent>
        </Card>

        <Card className={`border-${budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}-200 bg-${budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}-50`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium text-${budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}-800`}>
              Budget Status
            </CardTitle>
            {budgetUtilization > 90 ? 
              <TrendingDown className="h-4 w-4 text-red-600" /> : 
              <TrendingUp className="h-4 w-4 text-green-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}-700`}>
              ${((metrics.totalBudget - metrics.totalSpent) / 1000000).toFixed(1)}M
            </div>
            <p className={`text-xs text-${budgetUtilization > 90 ? 'red' : budgetUtilization > 75 ? 'orange' : 'green'}-600`}>
              Remaining budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Performance Summary</CardTitle>
          <CardDescription>
            High-level overview of project portfolio health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Completion Rate</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projects Completed</span>
                  <span>{projectCompletionRate.toFixed(1)}%</span>
                </div>
                <Progress value={projectCompletionRate} className="h-2" />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Budget Efficiency</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Utilized</span>
                  <span>{budgetUtilization.toFixed(1)}%</span>
                </div>
                <Progress value={budgetUtilization} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
