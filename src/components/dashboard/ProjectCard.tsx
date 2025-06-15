
import { MapPin, Calendar, Clock, User } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    progress: number;
    budget?: number;
    spent?: number;
    end_date?: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    location?: string;
    client?: {
      id: string;
      company_name?: string;
      contact_person?: string;
      stakeholder_type: string;
    };
  };
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const statusColors = {
    'planning': 'bg-blue-100 text-blue-800',
    'active': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const progressColor = project.progress >= 75 ? 'bg-green-500' : 
                       project.progress >= 50 ? 'bg-orange-500' : 'bg-blue-500';

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getClientDisplayName = () => {
    if (!project.client) return null;
    return project.client.company_name || project.client.contact_person || 'Unknown Client';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
          {project.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          {project.status.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        {project.client && (
          <div className="flex items-center text-sm text-slate-600">
            <User size={16} className="mr-2" />
            <span className="font-medium text-slate-700">Client:</span>
            <span className="ml-1">{getClientDisplayName()}</span>
          </div>
        )}

        {project.location && (
          <div className="flex items-center text-sm text-slate-600">
            <MapPin size={16} className="mr-2" />
            {project.location}
          </div>
        )}

        {project.end_date && (
          <div className="flex items-center text-sm text-slate-600">
            <Calendar size={16} className="mr-2" />
            Due: {formatDate(project.end_date)}
          </div>
        )}

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-800">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {project.budget && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Budget</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${project.budget > 0 ? ((project.spent || 0) / project.budget) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
