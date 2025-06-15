
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useProjects } from '@/hooks/useProjects';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export const ResourceAllocation = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { allocations, loading } = useResourceAllocations(selectedProjectId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        type="projects"
        title="No Projects Available"
        description="Create a project first to manage resource allocations."
        actionLabel="Go to Projects"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Resource Allocation</h3>
          
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-6">
          {allocations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Resource Allocations</h3>
              <p className="text-slate-500">Start by creating resource allocations for your projects.</p>
            </div>
          ) : (
            allocations.map((allocation) => (
              <div key={allocation.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-800">{allocation.team_name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={(allocation.allocation_type || 'weekly') === 'daily' ? 'default' : 'secondary'}>
                      {allocation.allocation_type || 'weekly'}
                    </Badge>
                    {allocation.total_used > allocation.total_budget && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Over Budget
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {allocation.members?.map((member) => (
                    <div key={member.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">{member.name}</span>
                        <span className="text-xs text-slate-500">{member.role}</span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {member.hours_used} / {member.hours_allocated} hours
                      </div>
                      <div className="text-xs text-slate-500">
                        ${member.cost_per_hour}/hr • {member.availability}% available
                      </div>
                      {member.date && (
                        <div className="text-xs text-slate-400 mt-1">
                          Date: {new Date(member.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="col-span-2 text-center text-slate-500 py-4">
                      No team members assigned yet
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">
                    Total Budget: ${allocation.total_budget.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    Used: ${allocation.total_used.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
