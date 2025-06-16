import { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, AlertTriangle, Calendar, UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { QuickTaskAssignDialog } from './QuickTaskAssignDialog';
import { TeamMember } from '@/types/database';

interface ResourcePlanningProps {
  projectId: string;
}

export const ResourcePlanning = ({ projectId }: ResourcePlanningProps) => {
  const { allocations, loading } = useResourceAllocations(projectId);
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [quickAssignOpen, setQuickAssignOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();

  const currentProject = projects.find(p => p.id === projectId);

  const handleQuickAssign = (member: TeamMember) => {
    setSelectedMember(member);
    setQuickAssignOpen(true);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-green-600 bg-green-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getBudgetStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
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

  const totalMembers = allocations.reduce((sum, allocation) => 
    sum + (allocation.members?.length || 0), 0
  );
  
  const totalHours = allocations.reduce((sum, allocation) => 
    sum + (allocation.members?.reduce((memberSum, member) => 
      memberSum + member.hours_allocated, 0) || 0), 0
  );
  
  const totalBudgetUsed = allocations.reduce((sum, allocation) => 
    sum + allocation.total_used, 0
  );
  
  const overallocatedCount = allocations.reduce((count, allocation) => 
    count + (allocation.members?.filter(m => m.availability > 100).length || 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Resource Planning - {currentProject.name}
        </h3>
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

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Resources</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {totalMembers}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {totalHours}
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Budget Used</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${totalBudgetUsed.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">Overallocated</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {overallocatedCount}
          </div>
        </div>
      </div>

      {/* Team Allocations */}
      <div className="space-y-6">
        {allocations.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Resource Allocations</h3>
            <p className="text-slate-500">Create resource allocations to manage your project team.</p>
          </div>
        ) : (
          allocations.map((allocation) => (
            <div key={allocation.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800">{allocation.team_name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Budget: <span className={getBudgetStatus(allocation.total_used, allocation.total_budget)}>
                        ${allocation.total_used.toLocaleString()} / ${allocation.total_budget.toLocaleString()}
                      </span>
                    </span>
                    <span className="text-slate-600">
                      {allocation.members?.length || 0} members
                    </span>
                  </div>
                </div>
              </div>

              {allocation.members && allocation.members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Resource</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Role</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Hours</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Utilization</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Cost</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Current Tasks</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocation.members.map((member, memberIndex) => (
                        <tr key={member.id} className={memberIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{member.name}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{member.role}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm">
                              <div className="font-medium">{member.hours_used} / {member.hours_allocated}h</div>
                              <div className="w-16 bg-slate-200 rounded-full h-2 mx-auto mt-1">
                                <div 
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${Math.min((member.hours_used / member.hours_allocated) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(member.availability)}`}>
                              {member.availability}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm">
                              <div className="font-medium">${(member.hours_used * member.cost_per_hour).toLocaleString()}</div>
                              <div className="text-slate-500">${member.cost_per_hour}/hr</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {member.tasks?.length > 0 ? member.tasks.map((task, taskIndex) => (
                                <span key={taskIndex} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                  {task}
                                </span>
                              )) : (
                                <span className="text-xs text-slate-500">No tasks assigned</span>
                              )}
                            </div>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-slate-500">
                  No team members assigned to this allocation yet.
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resource Conflicts - Only show if there are actual conflicts */}
      {overallocatedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-600" />
            <h4 className="font-semibold text-red-800">Resource Conflicts</h4>
          </div>
          <div className="space-y-2 text-sm text-red-700">
            <div>• {overallocatedCount} team member{overallocatedCount !== 1 ? 's are' : ' is'} overallocated</div>
            <div>• Review resource allocation to prevent burnout and delays</div>
          </div>
        </div>
      )}

      <QuickTaskAssignDialog
        open={quickAssignOpen}
        onOpenChange={setQuickAssignOpen}
        projectId={projectId}
        preSelectedMember={selectedMember}
      />
    </div>
  );
};
