
export const ResourceAllocation = () => {
  const allocations = [
    {
      project: 'Downtown Office Complex',
      teams: [
        { name: 'Foundation Crew', members: 6, hours: 48 },
        { name: 'Steel Workers', members: 4, hours: 32 }
      ],
      totalHours: 80,
      budget: 15600
    },
    {
      project: 'Residential Housing Phase 2',
      teams: [
        { name: 'Framing Crew', members: 8, hours: 64 },
        { name: 'Electrical Team', members: 3, hours: 24 }
      ],
      totalHours: 88,
      budget: 14200
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Resource Allocation</h3>
        
        <div className="space-y-6">
          {allocations.map((allocation, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-3">{allocation.project}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {allocation.teams.map((team, teamIndex) => (
                  <div key={teamIndex} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{team.name}</span>
                      <span className="text-xs text-slate-500">{team.members} members</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {team.hours} hours scheduled
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                  Total: {allocation.totalHours} hours
                </span>
                <span className="text-sm font-medium text-slate-800">
                  Budget: ${allocation.budget.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
