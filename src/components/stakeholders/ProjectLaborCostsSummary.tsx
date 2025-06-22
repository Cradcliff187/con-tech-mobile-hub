
import { useProjectLaborCosts } from '@/hooks/useProjectLaborCosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';

interface ProjectLaborCostsSummaryProps {
  projectId?: string;
}

export const ProjectLaborCostsSummary = ({ projectId }: ProjectLaborCostsSummaryProps) => {
  const { laborCosts, loading } = useProjectLaborCosts(projectId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={20} />
            Labor Costs Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCost = laborCosts.reduce((sum, cost) => sum + cost.total_cost, 0);
  const totalHours = laborCosts.reduce((sum, cost) => sum + cost.total_hours, 0);
  const avgRate = totalHours > 0 ? totalCost / totalHours : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign size={20} />
          Labor Costs Summary
          {projectId && <Badge variant="outline">Project View</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {laborCosts.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Employee Assignments</h3>
            <p className="text-slate-500">No employee labor costs found for the selected project(s).</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Cost</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalCost)}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Hours</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {totalHours.toFixed(1)}h
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Avg Rate</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(avgRate)}/hr
                </div>
              </div>
            </div>

            {/* Project Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800">Project Breakdown</h4>
              {laborCosts.map((cost) => (
                <div key={`${cost.project_id}-${cost.stakeholder_type}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-slate-800">
                        {cost.project_name || `Project ${cost.project_id}`}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cost.stakeholder_type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {cost.assignment_count} assignment{cost.assignment_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">
                        {formatCurrency(cost.total_cost)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {cost.total_hours.toFixed(1)} hours
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar showing cost relative to total */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Cost Distribution</span>
                      <span>{((cost.total_cost / totalCost) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={totalCost > 0 ? (cost.total_cost / totalCost) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Avg Rate:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(cost.avg_hourly_rate)}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-medium ml-1">
                        {cost.earliest_start_date && cost.latest_end_date
                          ? `${new Date(cost.earliest_start_date).toLocaleDateString()} - ${new Date(cost.latest_end_date).toLocaleDateString()}`
                          : 'Ongoing'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
