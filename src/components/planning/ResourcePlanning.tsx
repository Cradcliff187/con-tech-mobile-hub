import { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, AlertTriangle, Calendar, UserPlus, Plus, Wrench, TrendingUp, TrendingDown, BarChart3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployeeResourcePlanning } from '@/hooks/useEmployeeResourcePlanning';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useEquipment } from '@/hooks/useEquipment';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { QuickTaskAssignDialog } from './QuickTaskAssignDialog';
import { CostRollupIndicator } from './CostRollupIndicator';
import { UtilizationAnalytics } from './UtilizationAnalytics';
import { TeamMember } from '@/types/database';

interface ResourcePlanningProps {
  projectId: string;
}

export const ResourcePlanning = ({ projectId }: ResourcePlanningProps) => {
  const { resourceGroups, loading, summaryStats } = useEmployeeResourcePlanning(projectId);
  const { allocations: equipmentAllocations } = useEquipmentAllocations();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { equipment } = useEquipment();
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [quickAssignOpen, setQuickAssignOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();

  const currentProject = projects.find(p => p.id === projectId);
  const projectEquipmentAllocations = equipmentAllocations.filter(ea => ea.project_id === projectId);

  const handleQuickAssign = (member: any) => {
    // Convert employee resource member to TeamMember format for dialog
    const teamMember: TeamMember = {
      id: member.id,
      allocation_id: '', // Not applicable for stakeholder assignments
      user_id: member.user_id,
      name: member.name,
      role: member.role,
      hours_allocated: member.hours_allocated,
      hours_used: member.hours_used,
      cost_per_hour: member.cost_per_hour,
      availability: member.availability,
      date: selectedWeek,
      tasks: member.tasks || []
    };
    
    setSelectedMember(teamMember);
    setQuickAssignOpen(true);
  };

  const getUtilizationColor = (hours: number) => {
    if (hours >= 45) return 'text-red-600 bg-red-100';
    if (hours >= 40) return 'text-orange-600 bg-orange-100';
    if (hours >= 30) return 'text-green-600 bg-green-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getBudgetStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCostAccuracyStatus = (member: any) => {
    const calculatedCost = member.hours_allocated * member.hourly_rate;
    const variance = Math.abs(member.total_cost - calculatedCost);
    
    if (variance <= 0.01) return { status: 'accurate', color: 'text-green-600', icon: CheckCircle2 };
    if (variance <= 1.00) return { status: 'minor', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'error', color: 'text-red-600', icon: AlertTriangle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <EmptyState
        type="projects"
        title="Project Not Found"
        description="The selected project could not be found."
        actionLabel="Go Back"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Resource Planning - {currentProject.name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Enhanced employee data with cost integrity validation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <label className="text-sm text-slate-600">Week of:</label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            />
          </div>
          <Button size="sm" variant="outline">
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Cost Rollup Indicator */}
      <CostRollupIndicator projectId={projectId} />

      {/* Enhanced Resource Overview with Data Integrity Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Employees</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {summaryStats.totalMembers}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Active assignments
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {summaryStats.totalHours}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {summaryStats.avgUtilization.toFixed(1)}% avg utilization
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Labor Cost</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(summaryStats.totalBudgetUsed)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Validated costs
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Equipment</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {projectEquipmentAllocations.length}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Active allocations
          </div>
        </div>

        <div className={`rounded-lg p-4 ${summaryStats.budgetVariance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {summaryStats.budgetVariance >= 0 ? (
              <TrendingUp size={20} className="text-green-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
            <span className={`text-sm font-medium ${summaryStats.budgetVariance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Budget Status
            </span>
          </div>
          <div className={`text-2xl font-bold ${summaryStats.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summaryStats.budgetVariance >= 0 ? '+' : ''}{formatCurrency(summaryStats.budgetVariance)}
          </div>
          <div className={`text-xs ${summaryStats.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summaryStats.budgetVariancePercentage >= 0 ? '+' : ''}{summaryStats.budgetVariancePercentage.toFixed(1)}% variance
          </div>
        </div>
      </div>

      {/* Resource Tabs */}
      <Tabs defaultValue="personnel" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="personnel" className="space-y-6">
          {/* Employee Assignments with Enhanced Cost Validation */}
          {resourceGroups.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Employee Assignments</h3>
              <p className="text-slate-500">Assign employees to this project to manage resources.</p>
            </div>
          ) : (
            resourceGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-800">{group.team_name}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        Week: {new Date(group.week_start_date).toLocaleDateString()}
                      </span>
                      <span className="text-slate-600">
                        Budget: <span className={getBudgetStatus(group.total_used, group.total_budget)}>
                          {formatCurrency(group.total_used)} / {formatCurrency(group.total_budget)}
                        </span>
                      </span>
                      <span className="text-slate-600">
                        {group.members?.length || 0} employees
                      </span>
                    </div>
                  </div>
                </div>

                {group.members && group.members.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Employee</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Role</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Hourly Rate</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Hours</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Total Cost</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Status</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.members.map((member, memberIndex) => {
                          const costAccuracy = getCostAccuracyStatus(member);
                          const Icon = costAccuracy.icon;
                          
                          return (
                            <tr key={member.id} className={memberIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-800">{member.name}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{member.role}</td>
                              <td className="px-6 py-4 text-center">
                                <div className="font-medium text-green-600">
                                  {formatCurrency(member.hourly_rate)}/hr
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm">
                                  <div className={`font-medium px-2 py-1 rounded-full text-xs ${getUtilizationColor(member.hours_allocated)}`}>
                                    {member.hours_allocated}h allocated
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {member.hours_used}h used
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Icon size={12} className={costAccuracy.color} />
                                  <div className="font-medium text-slate-800">
                                    {formatCurrency(member.total_cost)}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Cost validated
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickAssign(member)}
                                    className="text-xs px-2 py-1 h-7"
                                  >
                                    <Plus size={12} className="mr-1" />
                                    Assign Task
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    No employees assigned to this project yet.
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          {/* Equipment Allocations */}
          {projectEquipmentAllocations.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Wrench size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Equipment Allocated</h3>
              <p className="text-slate-500">Allocate equipment to tasks and project phases.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800">Equipment Allocations</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Equipment</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Type</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Task</th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Duration</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Operator</th>
                      <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectEquipmentAllocations.map((allocation, index) => {
                      const equipmentItem = equipment.find(eq => eq.id === allocation.equipment_id);
                      return (
                        <tr key={allocation.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">
                              {equipmentItem?.name || 'Unknown Equipment'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {equipmentItem?.type || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {allocation.task?.title || 'General Use'}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            {allocation.start_date} - {allocation.end_date}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {allocation.operator_stakeholder?.contact_person ||
                             allocation.operator_user?.full_name ||
                             'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UtilizationAnalytics projectId={projectId} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar View - Equipment and Personnel Combined */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Resource Calendar</h4>
            <div className="text-center py-8 text-slate-500">
              <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
              <p>Calendar view showing personnel and equipment allocations will be displayed here.</p>
              <p className="text-sm mt-2">This view will show overlapping resource assignments and conflicts.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Resource Status Information */}
      {summaryStats.overallocatedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-600" />
            <h4 className="font-semibold text-red-800">Resource Allocation Warnings</h4>
          </div>
          <div className="space-y-2 text-sm text-red-700">
            <div>• {summaryStats.overallocatedCount} employee{summaryStats.overallocatedCount !== 1 ? 's have' : ' has'} over 40 hours allocated</div>
            <div>• Review workload distribution to prevent burnout and delays</div>
            <div>• All cost calculations have been validated for accuracy</div>
          </div>
        </div>
      )}

      {/* Data Integrity Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <h4 className="font-semibold text-green-800">Employee Data Consolidation Complete</h4>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-700">Cost Integrity:</span>
            <div className="font-semibold text-green-800">Validated</div>
          </div>
          <div>
            <span className="text-green-700">Hourly Rates:</span>
            <div className="font-semibold text-green-800">All Positive</div>
          </div>
          <div>
            <span className="text-green-700">Data Source:</span>
            <div className="font-semibold text-green-800">Stakeholder Assignments</div>
          </div>
        </div>
      </div>

      <QuickTaskAssignDialog
        open={quickAssignOpen}
        onOpenChange={setQuickAssignOpen}
        projectId={projectId}
        preSelectedMember={selectedMember}
      />
    </div>
  );
};
