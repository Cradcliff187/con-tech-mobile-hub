
import { MapPin, Calendar, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    progress: number;
    budget: number;
    spent: number;
    dueDate: string;
    status: 'on-track' | 'delayed' | 'completed';
    location: string;
  };
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800',
    'delayed': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800'
  };

  const progressColor = project.progress >= 75 ? 'bg-green-500' : 
                       project.progress >= 50 ? 'bg-orange-500' : 'bg-blue-500';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        <div className="flex items-center text-sm text-slate-600">
          <MapPin size={16} className="mr-2" />
          {project.location}
        </div>

        <div className="flex items-center text-sm text-slate-600">
          <Calendar size={16} className="mr-2" />
          Due: {formatDate(project.dueDate)}
        </div>

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
              style={{ width: `${(project.spent / project.budget) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
