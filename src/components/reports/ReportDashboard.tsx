
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

export const ReportDashboard = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  if (projectsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 bg-slate-200 rounded mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate real metrics from database
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  // Schedule performance calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const onTimeTasks = tasks.filter(t => 
    t.status === 'completed' && 
    t.due_date && 
    t.updated_at && 
    new Date(t.updated_at) <= new Date(t.due_date)
  ).length;
  
  const schedulePerformance = totalTasks > 0 ? Math.round((onTimeTasks / totalTasks) * 100) : 0;
  
  // Budget calculations
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const budgetEfficiency = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
  
  // Resource utilization (simplified calculation)
  const tasksInProgress = tasks.filter(t => t.status === 'in-progress').length;
  const resourceUtilization = totalTasks > 0 ? Math.round((tasksInProgress / totalTasks) * 100) : 0;

  const metrics = [
    {
      title: 'Schedule Performance',
      value: `${schedulePerformance}%`,
      change: totalTasks > 0 ? `${onTimeTasks}/${totalTasks} on time` : 'No tasks',
      trend: schedulePerformance >= 90 ? 'up' : 'down',
      description: 'Projects on or ahead of schedule'
    },
    {
      title: 'Budget Efficiency',
      value: `${budgetEfficiency}%`,
      change: totalBudget > 0 ? `$${(totalSpent/1000).toFixed(0)}k spent` : 'No budget',
      trend: budgetEfficiency >= 90 ? 'up' : 'down',
      description: 'Staying within budget targets'
    },
    {
      title: 'Resource Utilization',
      value: `${resourceUtilization}%`,
      change: `${tasksInProgress}/${totalTasks} active`,
      trend: resourceUtilization >= 80 ? 'up' : 'down',
      description: 'Average task utilization'
    },
    {
      title: 'Total Project Value',
      value: totalBudget > 0 ? `$${(totalBudget/1000000).toFixed(1)}M` : '$0',
      change: completedProjects.length > 0 ? `${completedProjects.length} completed` : 'No completions',
      trend: completedProjects.length > 0 ? 'up' : 'down',
      description: 'Total project portfolio value'
    }
  ];

  console.log('ReportDashboard Debug:', {
    projectsCount: projects.length,
    activeProjects: activeProjects.length,
    tasksCount: tasks.length,
    schedulePerformance,
    budgetEfficiency,
    totalBudget,
    totalSpent
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
              {metric.trend === 'up' ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-bold text-slate-800">{metric.value}</span>
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-xs text-slate-500">{metric.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Summary</h3>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-slate-400" />
              <h4 className="font-medium text-slate-600 mb-2">No Projects Found</h4>
              <p className="text-slate-500">Create some projects to see detailed reports here</p>
            </div>
          ) : (
            activeProjects.map((project) => {
              const projectTasks = tasks.filter(t => t.project_id === project.id);
              const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
              const taskProgress = projectTasks.length > 0 ? 
                Math.round((completedProjectTasks / projectTasks.length) * 100) : 0;
              
              const budgetUsed = project.budget && project.spent ? 
                Math.round((project.spent / project.budget) * 100) : 0;
                
              const issues = projectTasks.filter(t => 
                t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
              ).length;

              return (
                <div key={project.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-slate-800">{project.name}</h4>
                    <div className="flex items-center gap-2">
                      {issues > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {issues} overdue
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium">{project.progress || taskProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${project.progress || taskProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Budget</span>
                        <span className="font-medium">{budgetUsed}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budgetUsed >= 95 ? 'bg-red-500' : 
                            budgetUsed >= 85 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {project.budget && (
                    <div className="mt-2 text-xs text-slate-500">
                      Budget: ${project.spent?.toLocaleString() || 0} / ${project.budget.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
