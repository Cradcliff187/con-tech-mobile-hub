
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

import { useEmployeeCostAnalytics } from '@/hooks/useEmployeeCostAnalytics';
import { useBurnRateAnalysis } from '@/hooks/useBurnRateAnalysis';
import { useProjects } from '@/hooks/useProjects';

import { ProjectCostOverview } from './ProjectCostOverview';
import { EmployeeEarningsCard } from './EmployeeEarningsCard';
import { BurnRateChart } from './BurnRateChart';
import { CostExportDialog } from './CostExportDialog';

export const EmployeeCostDashboard = () => {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Analytics hooks
  const {
    employeeCostSummaries,
    projectCostSummaries,
    overallAnalytics,
    loading
  } = useEmployeeCostAnalytics(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    selectedProject === 'all' ? undefined : selectedProject
  );

  const { burnRateData, burnRateMetrics } = useBurnRateAnalysis(
    selectedProject === 'all' ? undefined : selectedProject,
    dateRange.from,
    dateRange.to
  );

  // Filter data based on selected project
  const filteredProjects = useMemo(() => {
    if (selectedProject === 'all') return projectCostSummaries;
    return projectCostSummaries.filter(p => p.projectId === selectedProject);
  }, [projectCostSummaries, selectedProject]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = (options: any) => {
    // Export functionality would be implemented here
    console.log('Export options:', options);
  };

  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case '7days':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case '30days':
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case '90days':
        setDateRange({ from: subDays(today, 90), to: today });
        break;
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Cost Dashboard</h1>
          <p className="text-slate-600">Track labor costs, utilization, and budget performance</p>
        </div>
        <div className="flex items-center gap-2">
          <CostExportDialog onExport={handleExport} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
        {/* Project Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal flex-1")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {/* Quick Date Presets */}
            <div className="hidden sm:flex gap-1">
              {['7days', '30days', '90days'].map(preset => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset(preset)}
                >
                  {preset === '7days' ? '7d' : preset === '30days' ? '30d' : '90d'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallAnalytics.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Across {overallAnalytics.totalProjects} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallAnalytics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {overallAnalytics.totalVariancePercentage >= 0 ? 'Under' : 'Over'} budget by{' '}
              {Math.abs(overallAnalytics.totalVariancePercentage).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.totalHours.toFixed(0)}h</div>
            <p className="text-xs text-muted-foreground">
              {overallAnalytics.totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.avgUtilization.toFixed(1)}%</div>
            <Badge variant={overallAnalytics.avgUtilization >= 80 ? 'default' : 'secondary'}>
              {overallAnalytics.avgUtilization >= 80 ? 'Good' : 'Low'} Utilization
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectCostOverview projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Employee Earnings Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {employeeCostSummaries.map(employee => (
                <EmployeeEarningsCard key={employee.employeeId} employee={employee} />
              ))}
            </div>
            {employeeCostSummaries.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No employee data available for the selected period.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <BurnRateChart data={burnRateData} metrics={burnRateMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
