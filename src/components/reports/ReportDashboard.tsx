
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

export const ReportDashboard = () => {
  const metrics = [
    {
      title: 'Schedule Performance',
      value: '92%',
      change: '+5%',
      trend: 'up',
      description: 'Projects on or ahead of schedule'
    },
    {
      title: 'Budget Efficiency',
      value: '96%',
      change: '+2%',
      trend: 'up',
      description: 'Staying within budget targets'
    },
    {
      title: 'Resource Utilization',
      value: '84%',
      change: '-3%',
      trend: 'down',
      description: 'Average crew utilization'
    },
    {
      title: 'Cost Performance',
      value: '$2.8M',
      change: '+12%',
      trend: 'up',
      description: 'Total project value completed'
    }
  ];

  const projects = [
    {
      name: 'Downtown Office Complex',
      progress: 68,
      schedule: 'On Track',
      budget: 94,
      issues: 0
    },
    {
      name: 'Residential Housing Phase 2',
      progress: 34,
      schedule: 'On Track',
      budget: 98,
      issues: 1
    },
    {
      name: 'Highway Bridge Renovation',
      progress: 89,
      schedule: 'Delayed',
      budget: 87,
      issues: 3
    }
  ];

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
          {projects.map((project, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-slate-800">{project.name}</h4>
                <div className="flex items-center gap-2">
                  {project.issues > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {project.issues} issues
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.schedule === 'On Track' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {project.schedule}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Budget</span>
                    <span className="font-medium">{project.budget}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.budget >= 95 ? 'bg-green-500' : 
                        project.budget >= 85 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${project.budget}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
