
import React from 'react';
import { Project } from '@/types/database';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { LifecycleStatusBadge } from '@/components/ui/lifecycle-status-badge';
import { getStatusProgressionPercentage } from '@/types/projectStatus';

interface ProjectStatusDisplayProps {
  project: Project;
  showProgression?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProjectStatusDisplay = ({ 
  project, 
  showProgression = false,
  size = 'md' 
}: ProjectStatusDisplayProps) => {
  const lifecycleStatus = getLifecycleStatus(project);
  const progressionPercentage = getStatusProgressionPercentage(lifecycleStatus);

  return (
    <div className="flex items-center space-x-2">
      <LifecycleStatusBadge 
        status={lifecycleStatus} 
        size={size}
      />
      {showProgression && (
        <span className="text-xs text-slate-500">
          ({progressionPercentage}%)
        </span>
      )}
    </div>
  );
};
