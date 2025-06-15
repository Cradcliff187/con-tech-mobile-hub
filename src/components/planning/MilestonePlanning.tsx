
import { useMilestones } from '@/hooks/useMilestones';
import { useProjects } from '@/hooks/useProjects';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useState } from 'react';

interface MilestonePlanningProps {
  projectId?: string;
}

export const MilestonePlanning = ({ projectId: initialProjectId }: MilestonePlanningProps) => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const { milestones, loading } = useMilestones(selectedProjectId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <Clock className="text-orange-500" size={20} />;
      case 'overdue':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
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
        <h3 className="text-lg font-semibold text-slate-800">Project Milestones</h3>
        
        {projects.length > 0 && (
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
        )}
      </div>

      {milestones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Milestones Found</h3>
          <p className="text-slate-500">
            {selectedProjectId ? 'No milestones found for the selected project.' : 'Create a project to see milestone planning.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(milestone.status)}
                    <h4 className="font-medium text-slate-800">{milestone.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </div>
                  
                  {milestone.description && (
                    <p className="text-sm text-slate-600 mb-3">{milestone.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {new Date(milestone.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
