
import { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResourcePlanningProps {
  projectId: string;
}

interface ResourceAllocation {
  id: string;
  name: string;
  role: string;
  hoursAllocated: number;
  hoursUsed: number;
  costPerHour: number;
  availability: number;
  tasks: string[];
}

interface TeamAllocation {
  teamName: string;
  members: ResourceAllocation[];
  totalBudget: number;
  totalUsed: number;
}

export const ResourcePlanning = ({ projectId }: ResourcePlanningProps) => {
  const [teamAllocations, setTeamAllocations] = useState<TeamAllocation[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('2024-06-14');

  useEffect(() => {
    // Mock data for resource planning - in real app, this would come from API
    const mockTeams: TeamAllocation[] = [
      {
        teamName: 'Foundation Crew',
        totalBudget: 25000,
        totalUsed: 18500,
        members: [
          {
            id: '1',
            name: 'Mike Johnson',
            role: 'Site Supervisor',
            hoursAllocated: 40,
            hoursUsed: 38,
            costPerHour: 35,
            availability: 95,
            tasks: ['Site Preparation', 'Foundation Work']
          },
          {
            id: '2',
            name: 'Sarah Williams',
            role: 'Equipment Operator',
            hoursAllocated: 40,
            hoursUsed: 40,
            costPerHour: 28,
            availability: 100,
            tasks: ['Excavation', 'Foundation Work']
          },
          {
            id: '3',
            name: 'Tom Rodriguez',
            role: 'Labor',
            hoursAllocated: 40,
            hoursUsed: 35,
            costPerHour: 22,
            availability: 87,
            tasks: ['Site Preparation', 'Foundation Work']
          }
        ]
      },
      {
        teamName: 'Steel Crew',
        totalBudget: 32000,
        totalUsed: 12800,
        members: [
          {
            id: '4',
            name: 'David Chen',
            role: 'Steel Foreman',
            hoursAllocated: 40,
            hoursUsed: 16,
            costPerHour: 38,
            availability: 40,
            tasks: ['Structural Framing']
          },
          {
            id: '5',
            name: 'Maria Garcia',
            role: 'Welder',
            hoursAllocated: 40,
            hoursUsed: 16,
            costPerHour: 32,
            availability: 40,
            tasks: ['Structural Framing']
          }
        ]
      }
    ];

    setTeamAllocations(mockTeams);
  }, [projectId]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Resource Planning</h3>
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
            {teamAllocations.reduce((sum, team) => sum + team.members.length, 0)}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {teamAllocations.reduce((sum, team) => 
              sum + team.members.reduce((teamSum, member) => teamSum + member.hoursAllocated, 0), 0
            )}
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Budget Used</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${teamAllocations.reduce((sum, team) => sum + team.totalUsed, 0).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">Overallocated</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {teamAllocations.reduce((count, team) => 
              count + team.members.filter(m => m.availability > 100).length, 0
            )}
          </div>
        </div>
      </div>

      {/* Team Allocations */}
      <div className="space-y-6">
        {teamAllocations.map((team, index) => (
          <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-800">{team.teamName}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">
                    Budget: <span className={getBudgetStatus(team.totalUsed, team.totalBudget)}>
                      ${team.totalUsed.toLocaleString()} / ${team.totalBudget.toLocaleString()}
                    </span>
                  </span>
                  <span className="text-slate-600">
                    {team.members.length} members
                  </span>
                </div>
              </div>
            </div>

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
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((member, memberIndex) => (
                    <tr key={member.id} className={memberIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{member.role}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">
                          <div className="font-medium">{member.hoursUsed} / {member.hoursAllocated}h</div>
                          <div className="w-16 bg-slate-200 rounded-full h-2 mx-auto mt-1">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min((member.hoursUsed / member.hoursAllocated) * 100, 100)}%` }}
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
                          <div className="font-medium">${(member.hoursUsed * member.costPerHour).toLocaleString()}</div>
                          <div className="text-slate-500">${member.costPerHour}/hr</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {member.tasks.map((task, taskIndex) => (
                            <span key={taskIndex} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                              {task}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Conflicts */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={20} className="text-red-600" />
          <h4 className="font-semibold text-red-800">Resource Conflicts</h4>
        </div>
        <div className="space-y-2 text-sm text-red-700">
          <div>• Mike Johnson is allocated to overlapping tasks on June 18-19</div>
          <div>• Steel Crew is over budget by 15% for the current phase</div>
          <div>• Equipment Operator needed for Foundation Work but assigned to Excavation</div>
        </div>
      </div>
    </div>
  );
};
