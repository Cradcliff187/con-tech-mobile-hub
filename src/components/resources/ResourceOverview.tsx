
import { Users, Clock, CheckCircle } from 'lucide-react';

export const ResourceOverview = () => {
  const teams = [
    {
      id: 1,
      name: 'Foundation Crew',
      members: 6,
      currentProject: 'Downtown Office Complex',
      utilization: 85,
      status: 'active'
    },
    {
      id: 2,
      name: 'Electrical Team',
      members: 4,
      currentProject: 'Residential Housing Phase 2',
      utilization: 92,
      status: 'active'
    },
    {
      id: 3,
      name: 'Steel Workers',
      members: 8,
      currentProject: 'Highway Bridge Renovation',
      utilization: 78,
      status: 'active'
    },
    {
      id: 4,
      name: 'Site Prep Crew',
      members: 5,
      currentProject: 'Available',
      utilization: 0,
      status: 'available'
    }
  ];

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 70) return 'text-orange-600 bg-orange-100';
    if (utilization > 0) return 'text-green-600 bg-green-100';
    return 'text-slate-600 bg-slate-100';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Workers</p>
              <p className="text-2xl font-bold text-slate-800">127</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Teams</p>
              <p className="text-2xl font-bold text-slate-800">23</p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-slate-800">84%</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Team Overview</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {teams.map((team) => (
            <div key={team.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-slate-800 mb-1">
                    {team.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {team.members} members
                    </span>
                    <span>
                      Project: {team.currentProject}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Utilization</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(team.utilization)}`}>
                      {team.utilization}%
                    </span>
                  </div>
                  <div className={`w-2 h-12 rounded-full ${
                    team.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
