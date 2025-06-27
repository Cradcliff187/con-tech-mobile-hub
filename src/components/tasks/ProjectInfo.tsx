
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface ProjectInfoProps {
  project?: {
    id: string;
    name: string;
    status?: string;
    phase?: string;
    unified_lifecycle_status?: string;
  };
  size?: 'sm' | 'md';
  showStatus?: boolean;
  onProjectClick?: (projectId: string) => void;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({
  project,
  size = 'md',
  showStatus = true,
  onProjectClick
}) => {
  if (!project) {
    return (
      <div className="flex items-center gap-1 text-slate-400">
        <Building2 size={size === 'sm' ? 12 : 14} />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>No project</span>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick(project.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Building2 size={size === 'sm' ? 12 : 14} className="text-slate-500" />
        <button
          onClick={handleClick}
          className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-blue-600 hover:text-blue-800 hover:underline truncate cursor-pointer`}
        >
          {project.name}
        </button>
      </div>
      {showStatus && project.phase && (
        <Badge 
          variant="outline" 
          className={`${size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs'} ${getStatusColor(project.status)}`}
        >
          {project.phase}
        </Badge>
      )}
    </div>
  );
};
