import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { useSearchParams } from 'react-router-dom';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface ScheduleMetrics {
  onTimePercentage: number;
  delayedTasksCount: number;
  criticalPathCount: number;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    due_date: string;
    daysUntilDue: number;
    status: string;
  }>;
  totalCompletedTasks: number;
  totalOverdueTasks: number;
}

const getUrgencyColor = (daysUntilDue: number, isOverdue: boolean = false) => {
  if (isOverdue || daysUntilDue < 0) {
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'destructive' as const
    };
  } else if (daysUntilDue <= 2) {
    return {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'secondary' as const
    };
  } else {
    return {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'default' as const
    };
  }
};

const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const SchedulePerformance = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const { tasks, loading: tasksLoading } = useTasks({ projectId: projectId || undefined });
  const { milestones, loading: milestonesLoading } = useMilestones(projectId || undefined);

  const isLoading = tasksLoading || milestonesLoading;

  const scheduleMetrics: ScheduleMetrics & { error?: string } = useMemo(() => {
    try {
      if (tasks.length === 0 && milestones.length === 0 && !isLoading) {
        return {
          onTimePercentage: 0,
          delayedTasksCount: 0,
          criticalPathCount: 0,
          upcomingMilestones: [],
          totalCompletedTasks: 0,
          totalOverdueTasks: 0,
          error: 'No schedule data available'
        };
      }

      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      // Calculate on-time percentage
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const onTimeCompletedTasks = completedTasks.filter(task => {
        if (!task.due_date) return true; // No due date means it can't be late
        return new Date(task.due_date) >= today || task.status === 'completed';
      });
      const onTimePercentage = completedTasks.length > 0 
        ? Math.round((onTimeCompletedTasks.length / completedTasks.length) * 100)
        : 100;

      // Calculate delayed tasks (overdue and not completed)
      const delayedTasks = tasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        new Date(task.due_date) < today
      );

      // Calculate critical path items (critical priority and not completed)
      const criticalPathTasks = tasks.filter(task => 
        task.priority === 'critical' && 
        task.status !== 'completed'
      );

      // Get upcoming milestones (next 7 days)
      const upcomingMilestones = milestones
        .filter(milestone => {
          const dueDate = new Date(milestone.due_date);
          return dueDate >= today && dueDate <= sevenDaysFromNow;
        })
        .map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          due_date: milestone.due_date,
          daysUntilDue: getDaysUntilDue(milestone.due_date),
          status: milestone.status
        }))
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
        .slice(0, 5); // Limit to 5 most urgent

      return {
        onTimePercentage,
        delayedTasksCount: delayedTasks.length,
        criticalPathCount: criticalPathTasks.length,
        upcomingMilestones,
        totalCompletedTasks: completedTasks.length,
        totalOverdueTasks: delayedTasks.length
      };
    } catch (error) {
      console.error('Error calculating schedule metrics:', error);
      return {
        onTimePercentage: 0,
        delayedTasksCount: 0,
        criticalPathCount: 0,
        upcomingMilestones: [],
        totalCompletedTasks: 0,
        totalOverdueTasks: 0,
        error: 'Failed to calculate schedule performance'
      };
    }
  }, [tasks, milestones, isLoading]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} showProgress={i <= 2} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scheduleMetrics.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback 
            title="Schedule Data Unavailable"
            description={scheduleMetrics.error}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  const onTimeStatus = scheduleMetrics.onTimePercentage >= 85 
    ? { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    : scheduleMetrics.onTimePercentage >= 70
    ? { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
    : { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Schedule Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* On-Time Tasks Percentage */}
          <div className={`p-4 rounded-lg border ${onTimeStatus.bg} ${onTimeStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">On-Time Performance</h3>
              <CheckCircle className={`h-4 w-4 ${onTimeStatus.color}`} />
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${onTimeStatus.color}`}>
                  {scheduleMetrics.onTimePercentage}%
                </span>
                <span className="text-sm text-slate-500">on time</span>
              </div>
              <Progress 
                value={scheduleMetrics.onTimePercentage} 
                className="h-3"
              />
              <p className="text-xs text-slate-500">
                {scheduleMetrics.totalCompletedTasks} completed tasks tracked
              </p>
            </div>
          </div>

          {/* Delayed Tasks Count */}
          <div className={`p-4 rounded-lg border ${
            scheduleMetrics.delayedTasksCount === 0 
              ? 'bg-green-50 border-green-200' 
              : scheduleMetrics.delayedTasksCount <= 3
              ? 'bg-orange-50 border-orange-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Delayed Tasks</h3>
              <AlertTriangle className={`h-4 w-4 ${
                scheduleMetrics.delayedTasksCount === 0 
                  ? 'text-green-600' 
                  : scheduleMetrics.delayedTasksCount <= 3
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                scheduleMetrics.delayedTasksCount === 0 
                  ? 'text-green-600' 
                  : scheduleMetrics.delayedTasksCount <= 3
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`}>
                {scheduleMetrics.delayedTasksCount}
              </span>
              <span className="text-sm text-slate-500">overdue</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {scheduleMetrics.delayedTasksCount === 0 
                ? 'All tasks on schedule' 
                : 'Tasks past due date'
              }
            </p>
          </div>

          {/* Critical Path Items */}
          <div className={`p-4 rounded-lg border ${
            scheduleMetrics.criticalPathCount === 0 
              ? 'bg-green-50 border-green-200' 
              : scheduleMetrics.criticalPathCount <= 2
              ? 'bg-orange-50 border-orange-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Critical Path</h3>
              <Target className={`h-4 w-4 ${
                scheduleMetrics.criticalPathCount === 0 
                  ? 'text-green-600' 
                  : scheduleMetrics.criticalPathCount <= 2
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                scheduleMetrics.criticalPathCount === 0 
                  ? 'text-green-600' 
                  : scheduleMetrics.criticalPathCount <= 2
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`}>
                {scheduleMetrics.criticalPathCount}
              </span>
              <span className="text-sm text-slate-500">critical</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {scheduleMetrics.criticalPathCount === 0 
                ? 'No critical blockers' 
                : 'High priority incomplete tasks'
              }
            </p>
          </div>

          {/* Upcoming Milestones */}
          <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600">Upcoming Milestones</h3>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-2">
              {scheduleMetrics.upcomingMilestones.length > 0 ? (
                scheduleMetrics.upcomingMilestones.map((milestone) => {
                  const urgency = getUrgencyColor(milestone.daysUntilDue);
                  return (
                    <div key={milestone.id} className="flex items-center justify-between p-2 rounded border bg-white">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {milestone.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {milestone.daysUntilDue === 0 
                            ? 'Due today' 
                            : milestone.daysUntilDue === 1
                            ? 'Due tomorrow'
                            : `Due in ${milestone.daysUntilDue} days`
                          }
                        </p>
                      </div>
                      <Badge variant={urgency.badge} className="ml-2">
                        {milestone.daysUntilDue <= 0 ? 'Overdue' : milestone.daysUntilDue <= 2 ? 'Soon' : 'Upcoming'}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">No milestones in next 7 days</p>
                  <p className="text-xs text-slate-400 mt-1">Schedule is clear ahead</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
