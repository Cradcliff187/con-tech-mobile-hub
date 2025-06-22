
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, Clock, TrendingUp } from 'lucide-react';

interface ProjectCostSummary {
  projectId: string;
  projectName: string;
  budget: number;
  spent: number;
  variance: number;
  variancePercentage: number;
  employeeCount: number;
  totalHours: number;
  burnRate: number;
  employees: {
    employeeId: string;
    employeeName: string;
    hours: number;
    cost: number;
    role: string;
  }[];
}

interface ProjectCostOverviewProps {
  projects: ProjectCostSummary[];
}

export const ProjectCostOverview = ({ projects }: ProjectCostOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetStatus = (variancePercentage: number) => {
    if (variancePercentage >= 10) return { variant: 'default' as const, label: 'Under Budget' };
    if (variancePercentage >= 0) return { variant: 'secondary' as const, label: 'On Budget' };
    if (variancePercentage >= -10) return { variant: 'secondary' as const, label: 'Near Budget' };
    return { variant: 'destructive' as const, label: 'Over Budget' };
  };

  const getProgressColor = (spent: number, budget: number) => {
    if (budget === 0) return 'bg-gray-300';
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Project Cost Overview</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => {
          const budgetUtilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
          const budgetStatus = getBudgetStatus(project.variancePercentage);
          
          return (
            <Card key={project.projectId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {project.projectName}
                  </CardTitle>
                  <Badge variant={budgetStatus.variant}>
                    {budgetStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Budget Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Utilization</span>
                    <span className="font-medium">{budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(budgetUtilization, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Spent: {formatCurrency(project.spent)}</span>
                    <span>Budget: {formatCurrency(project.budget)}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Variance</span>
                    </div>
                    <div className={`text-sm font-bold ${
                      project.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {project.variance >= 0 ? '+' : ''}{formatCurrency(project.variance)}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={14} className="text-green-600" />
                      <span className="text-xs font-medium text-green-800">Employees</span>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {project.employeeCount}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-orange-600" />
                      <span className="text-xs font-medium text-orange-800">Hours</span>
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                      {project.totalHours.toFixed(0)}h
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Daily Burn</span>
                    </div>
                    <div className="text-sm font-bold text-purple-600">
                      {formatCurrency(project.burnRate)}
                    </div>
                  </div>
                </div>

                {/* Top Employees */}
                {project.employees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Top Contributors</h4>
                    <div className="space-y-2">
                      {project.employees
                        .sort((a, b) => b.cost - a.cost)
                        .slice(0, 3)
                        .map((employee) => (
                          <div key={employee.employeeId} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-slate-700">{employee.employeeName}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.role}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium text-slate-600">
                              {formatCurrency(employee.cost)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
