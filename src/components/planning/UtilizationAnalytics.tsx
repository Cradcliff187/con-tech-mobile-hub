
import { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCostRollup } from '@/hooks/useCostRollup';
import { format, addDays } from 'date-fns';

interface UtilizationAnalyticsProps {
  stakeholderId?: string;
  projectId?: string;
}

export const UtilizationAnalytics = ({ stakeholderId, projectId }: UtilizationAnalyticsProps) => {
  const { calculateEmployeeUtilization, loading } = useCostRollup();
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });

  const fetchUtilization = async () => {
    const result = await calculateEmployeeUtilization(
      stakeholderId,
      dateRange.start,
      dateRange.end
    );
    
    if (result.success) {
      setUtilizationData(result.data);
    }
  };

  useEffect(() => {
    fetchUtilization();
  }, [stakeholderId, dateRange]);

  const overallocatedEmployees = utilizationData.filter(item => item.is_overallocated);
  const totalEmployees = new Set(utilizationData.map(item => item.stakeholder_id)).size;
  const avgUtilization = utilizationData.length > 0 
    ? utilizationData.reduce((sum, item) => sum + item.utilization_percentage, 0) / utilizationData.length
    : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 85) return 'text-orange-600';
    if (percentage >= 70) return 'text-green-600';
    return 'text-blue-600';
  };

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return 'destructive';
    if (percentage >= 85) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Employee Utilization Analytics</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            />
          </div>
          <Button size="sm" onClick={fetchUtilization}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
              {avgUtilization.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overallocated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallocatedEmployees.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflict Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overallocatedEmployees.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Utilization Summary</CardTitle>
              <CardDescription>
                Daily utilization breakdown for all employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {utilizationData.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No utilization data available for the selected period.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    utilizationData.reduce((acc, item) => {
                      if (!acc[item.stakeholder_id]) {
                        acc[item.stakeholder_id] = {
                          name: item.stakeholder_name,
                          days: []
                        };
                      }
                      acc[item.stakeholder_id].days.push(item);
                      return acc;
                    }, {} as any)
                  ).map(([stakeholderId, employee]: any) => (
                    <div key={stakeholderId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-800">{employee.name}</h4>
                        <Badge variant={getBadgeVariant(
                          employee.days.reduce((sum: number, day: any) => sum + day.utilization_percentage, 0) / employee.days.length
                        )}>
                          Avg: {(employee.days.reduce((sum: number, day: any) => sum + day.utilization_percentage, 0) / employee.days.length).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {employee.days.slice(0, 7).map((day: any, index: number) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-center text-xs ${
                              day.is_overallocated 
                                ? 'bg-red-100 text-red-800' 
                                : day.utilization_percentage >= 85
                                ? 'bg-orange-100 text-orange-800'
                                : day.utilization_percentage >= 70
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <div className="font-medium">
                              {format(new Date(day.date_period), 'EEE')}
                            </div>
                            <div>{day.utilization_percentage.toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Conflicts</CardTitle>
              <CardDescription>
                Employees with overallocation issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overallocatedEmployees.length === 0 ? (
                <div className="text-center py-8 text-green-600">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-green-400" />
                  <p>No scheduling conflicts detected!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overallocatedEmployees.map((conflict, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-red-800">{conflict.stakeholder_name}</h4>
                        <Badge variant="destructive">
                          {conflict.utilization_percentage.toFixed(1)}% utilized
                        </Badge>
                      </div>
                      <div className="text-sm text-red-700">
                        <p>Date: {format(new Date(conflict.date_period), 'MMM dd, yyyy')}</p>
                        <p>Allocated: {conflict.total_allocated_hours}h / Available: {conflict.max_available_hours}h</p>
                        {conflict.conflict_details && (
                          <p>Excess: {conflict.conflict_details.excess_hours}h</p>
                        )}
                      </div>
                      {conflict.project_assignments && conflict.project_assignments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-800 mb-1">Project Assignments:</p>
                          <div className="space-y-1">
                            {conflict.project_assignments.map((assignment: any, i: number) => (
                              <div key={i} className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                {assignment.project_name} ({assignment.role}) - {assignment.daily_hours}h
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Assignments</CardTitle>
              <CardDescription>
                Detailed view of all employee assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  utilizationData
                    .filter(item => item.project_assignments && item.project_assignments.length > 0)
                    .reduce((acc, item) => {
                      item.project_assignments.forEach((assignment: any) => {
                        const key = `${assignment.project_name}-${item.date_period}`;
                        if (!acc[key]) {
                          acc[key] = {
                            project_name: assignment.project_name,
                            date: item.date_period,
                            assignments: []
                          };
                        }
                        acc[key].assignments.push({
                          employee: item.stakeholder_name,
                          role: assignment.role,
                          hours: assignment.daily_hours
                        });
                      });
                      return acc;
                    }, {} as any)
                ).map(([key, project]: any) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">{project.project_name}</h4>
                      <span className="text-sm text-slate-500">
                        {format(new Date(project.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.assignments.map((assignment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded">
                          <div>
                            <span className="font-medium text-slate-700">{assignment.employee}</span>
                            <span className="text-sm text-slate-500 ml-2">({assignment.role})</span>
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {assignment.hours.toFixed(1)}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
