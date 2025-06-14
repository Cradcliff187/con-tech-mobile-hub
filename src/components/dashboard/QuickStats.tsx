
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useDebugInfo } from '@/hooks/useDebugInfo';
import { CreateProjectDialog } from './CreateProjectDialog';
import { EmptyState } from './EmptyState';

export const QuickStats = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const debugInfo = useDebugInfo();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Calculate real metrics from database
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const budgetEfficiency = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  // Calculate schedule performance from tasks
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const schedulePerformance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Count active workers
  const activeWorkers = users.filter(u => 
    u.role === 'worker' && u.account_status === 'approved'
  ).length;

  console.log('QuickStats Debug:', {
    projectsCount: projects.length,
    activeProjects,
    tasksCount: tasks.length,
    usersCount: users.length,
    debugInfo
  });

  if (projectsLoading || tasksLoading || usersLoading) {
    return (
      <div className="md:col-span-2 lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 animate-pulse">
              <div className="h-8 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no projects exist
  if (projects.length === 0) {
    return (
      <div className="md:col-span-2 lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Stats</h2>
        <EmptyState
          type="projects"
          title="No Projects Yet"
          description="Create your first project to start tracking progress, managing teams, and monitoring budgets."
          actionLabel="Create First Project"
          onAction={() => setIsCreateProjectOpen(true)}
        />
        <CreateProjectDialog 
          open={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
        />
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Projects',
      value: activeProjects.toString(),
      change: `${projects.length} total projects`,
      color: 'text-blue-600'
    },
    {
      label: 'Schedule Performance',
      value: `${schedulePerformance}%`,
      change: totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks completed` : 'No tasks yet',
      color: schedulePerformance >= 75 ? 'text-green-600' : 'text-orange-600'
    },
    {
      label: 'Budget Efficiency',
      value: `${budgetEfficiency}%`,
      change: totalBudget > 0 ? `$${(totalSpent/1000).toFixed(0)}k/$${(totalBudget/1000).toFixed(0)}k` : 'No budget data',
      color: budgetEfficiency <= 95 ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Active Workers',
      value: activeWorkers.toString(),
      change: `${users.length} total users`,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="md:col-span-2 lg:col-span-2">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
            <div className="text-xs text-slate-500">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
