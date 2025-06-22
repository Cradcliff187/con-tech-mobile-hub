
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, DollarSign, Clock, Briefcase, TrendingUp } from 'lucide-react';

interface EmployeeCostSummary {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  totalEarnings: number;
  projectCount: number;
  utilizationRate: number;
  avgHourlyRate: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    earnings: number;
    role: string;
  }[];
}

interface EmployeeEarningsCardProps {
  employee: EmployeeCostSummary;
}

export const EmployeeEarningsCard = ({ employee }: EmployeeEarningsCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 80) return 'text-orange-600';
    if (rate >= 60) return 'text-green-600';
    return 'text-blue-600';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 100) return { variant: 'destructive' as const, label: 'Overallocated' };
    if (rate >= 85) return { variant: 'secondary' as const, label: 'High Utilization' };
    if (rate >= 60) return { variant: 'default' as const, label: 'Good Utilization' };
    return { variant: 'outline' as const, label: 'Low Utilization' };
  };

  const utilizationBadge = getUtilizationBadge(employee.utilizationRate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User size={16} className="text-slate-600" />
            {employee.employeeName}
          </CardTitle>
          <Badge variant={utilizationBadge.variant}>
            {utilizationBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-800">Total Earnings</span>
            </div>
            <div className="text-sm font-bold text-green-600">
              {formatCurrency(employee.totalEarnings)}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Total Hours</span>
            </div>
            <div className="text-sm font-bold text-blue-600">
              {employee.totalHours.toFixed(0)}h
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={14} className="text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Projects</span>
            </div>
            <div className="text-sm font-bold text-orange-600">
              {employee.projectCount}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-800">Avg Rate</span>
            </div>
            <div className="text-sm font-bold text-purple-600">
              {formatCurrency(employee.avgHourlyRate)}/h
            </div>
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Utilization Rate</span>
            <span className={`font-medium ${getUtilizationColor(employee.utilizationRate)}`}>
              {employee.utilizationRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(employee.utilizationRate, 100)} 
            className="h-2"
          />
        </div>

        {/* Project Breakdown */}
        {employee.projects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Project Breakdown</h4>
            <div className="space-y-2">
              {employee.projects
                .sort((a, b) => b.earnings - a.earnings)
                .slice(0, 3)
                .map((project) => (
                  <div key={project.projectId} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-slate-700">{project.projectName}</span>
                      <Badge variant="outline" className="text-xs">
                        {project.role}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-600">
                        {formatCurrency(project.earnings)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {project.hours.toFixed(0)}h
                      </div>
                    </div>
                  </div>
                ))}
              {employee.projects.length > 3 && (
                <div className="text-xs text-slate-500 text-center mt-2">
                  +{employee.projects.length - 3} more projects
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
