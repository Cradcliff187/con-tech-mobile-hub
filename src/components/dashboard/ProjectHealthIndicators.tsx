
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';

export const ProjectHealthIndicators = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const calculateHealthMetrics = () => {
    if (projects.length === 0) {
      return {
        onTrack: 0,
        atRisk: 0,
        delayed: 0,
        overallHealth: 0
      };
    }

    let onTrack = 0;
    let atRisk = 0;
    let delayed = 0;

    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const totalTasks = projectTasks.length;
      
      if (totalTasks === 0) {
        // Project with no tasks - consider neutral
        return;
      }

      const completionRate = (completedTasks / totalTasks) * 100;
      const today = new Date();
      const endDate = project.end_date ? new Date(project.end_date) : null;
      
      // Check if project is completed by checking if all tasks are completed
      const isProjectCompleted = totalTasks > 0 && completedTasks === totalTasks;
      
      if (isProjectCompleted) {
        onTrack++;
      } else if (endDate && endDate < today) {
        delayed++;
      } else if (completionRate < 30 && endDate && (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24) < 30) {
        atRisk++;
      } else {
        onTrack++;
      }
    });

    const total = projects.length;
    const overallHealth = total > 0 ? Math.round((onTrack / total) * 100) : 0;

    return { onTrack, atRisk, delayed, overallHealth };
  };

  const { onTrack, atRisk, delayed, overallHealth } = calculateHealthMetrics();

  const healthIndicators = [
    {
      label: 'On Track',
      value: onTrack,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    {
      label: 'At Risk',
      value: atRisk,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: AlertTriangle
    },
    {
      label: 'Delayed',
      value: delayed,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertTriangle
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <TrendingUp size={20} />
          Project Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Overall Health</span>
              <span className="text-sm font-medium text-slate-800">{overallHealth}%</span>
            </div>
            <Progress value={overallHealth} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {healthIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${indicator.bgColor} mb-2`}>
                    <Icon size={20} className={indicator.color} />
                  </div>
                  <div className="text-lg font-bold text-slate-800">{indicator.value}</div>
                  <div className="text-xs text-slate-500">{indicator.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
