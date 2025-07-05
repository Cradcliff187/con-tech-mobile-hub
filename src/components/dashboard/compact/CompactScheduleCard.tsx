import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { useSearchParams } from 'react-router-dom';
import { CompactMetricCard } from './CompactMetricCard';

interface CompactScheduleCardProps {
  onClick?: () => void;
  className?: string;
}

export const CompactScheduleCard = ({ onClick, className }: CompactScheduleCardProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const { tasks, loading: tasksLoading } = useTasks({ projectId: projectId || undefined });
  const { milestones, loading: milestonesLoading } = useMilestones(projectId || undefined);

  const isLoading = tasksLoading || milestonesLoading;

  const scheduleMetrics = useMemo(() => {
    if (tasks.length === 0 && milestones.length === 0 && !isLoading) {
      return {
        onTimePercentage: 0,
        delayedTasksCount: 0,
        color: 'text-slate-500'
      };
    }

    const today = new Date();

    // Calculate on-time percentage (same logic as SchedulePerformance)
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const onTimeCompletedTasks = completedTasks.filter(task => {
      if (!task.due_date) return true;
      return new Date(task.due_date) >= today || task.status === 'completed';
    });
    const onTimePercentage = completedTasks.length > 0 
      ? Math.round((onTimeCompletedTasks.length / completedTasks.length) * 100)
      : 100;

    // Calculate delayed tasks (same logic as SchedulePerformance)
    const delayedTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      task.due_date && 
      new Date(task.due_date) < today
    );

    // Color coding based on on-time percentage
    const color = onTimePercentage >= 85 
      ? 'text-green-600' 
      : onTimePercentage >= 70
      ? 'text-orange-600'
      : 'text-red-600';

    return {
      onTimePercentage,
      delayedTasksCount: delayedTasks.length,
      color
    };
  }, [tasks, milestones, isLoading]);

  const subtitle = scheduleMetrics.delayedTasksCount === 0 
    ? 'All on schedule' 
    : `${scheduleMetrics.delayedTasksCount} delayed task${scheduleMetrics.delayedTasksCount === 1 ? '' : 's'}`;

  return (
    <CompactMetricCard
      icon={Calendar}
      title="Schedule"
      value={`${scheduleMetrics.onTimePercentage}%`}
      subtitle={subtitle}
      color={scheduleMetrics.color}
      onClick={onClick}
      loading={isLoading}
      className={className}
    />
  );
};