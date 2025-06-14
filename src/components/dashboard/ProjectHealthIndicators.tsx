
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export const ProjectHealthIndicators = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const getProjectHealth = (project: any) => {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    if (projectTasks.length === 0) return { status: 'unknown', score: 0, issues: [] };

    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = projectTasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;
    const criticalTasks = projectTasks.filter(t => t.priority === 'critical').length;
    
    const completionRate = (completedTasks / projectTasks.length) * 100;
    const budgetUtilization = project.budget ? (project.spent / project.budget) * 100 : 0;
    
    let score = 100;
    const issues = [];

    // Deduct points for various issues
    if (overdueTasks > 0) {
      score -= overdueTasks * 10;
      issues.push(`${overdueTasks} overdue tasks`);
    }
    if (criticalTasks > 3) {
      score -= (criticalTasks - 3) * 5;
      issues.push(`${criticalTasks} critical tasks`);
    }
    if (budgetUtilization > 90) {
      score -= 20;
      issues.push('Budget nearly exhausted');
    }
    if (completionRate < project.progress - 10) {
      score -= 15;
      issues.push('Progress mismatch');
    }

    score = Math.max(0, score);

    let status = 'excellent';
    if (score < 70) status = 'poor';
    else if (score < 85) status = 'fair';
    else if (score < 95) status = 'good';

    return { status, score, issues };
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-orange-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle size={16} className="text-green-600" />;
      case 'good': return <TrendingUp size={16} className="text-blue-600" />;
      case 'fair': return <Clock size={16} className="text-orange-600" />;
      case 'poor': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-slate-500" />;
    }
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Health Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeProjects.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No active projects to monitor</p>
          ) : (
            activeProjects.map(project => {
              const health = getProjectHealth(project);
              return (
                <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getHealthIcon(health.status)}
                      <div>
                        <h4 className="font-medium text-slate-800">{project.name}</h4>
                        <p className="text-sm text-slate-600">{project.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={health.status === 'excellent' || health.status === 'good' ? 'default' : 'destructive'}>
                        {health.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{health.score}/100</div>
                        <div className="text-xs text-slate-500">Health Score</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={health.score} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600">Progress: {project.progress}%</span>
                      {project.budget && (
                        <span className="text-slate-600">
                          Budget: ${project.spent?.toLocaleString() || 0} / ${project.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {health.issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Issues requiring attention:</p>
                      <div className="flex flex-wrap gap-1">
                        {health.issues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
