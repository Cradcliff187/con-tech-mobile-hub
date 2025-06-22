
/**
 * @deprecated This component has been replaced by ProjectSummaryBar
 * 
 * LEGACY COMPONENT - DO NOT USE
 * 
 * This file is kept for reference only. QuickStats has been replaced by
 * ProjectSummaryBar which provides more comprehensive construction-specific
 * metrics including portfolio value, safety scores, and critical alerts.
 * 
 * Migration: Use ProjectSummaryBar instead
 * Location: src/components/dashboard/ProjectSummaryBar.tsx
 * 
 * Last used: Dashboard redesign (2025-06-22)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CheckSquare, Calendar } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useStakeholders } from '@/hooks/useStakeholders';

export const QuickStats = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { stakeholders } = useStakeholders();

  const totalProjects = projects.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const activeStakeholders = stakeholders.filter(s => s.status === 'active').length;

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Team Members',
      value: activeStakeholders,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      icon: CheckSquare,
      color: 'text-orange-600'
    },
    {
      title: 'This Week',
      value: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
