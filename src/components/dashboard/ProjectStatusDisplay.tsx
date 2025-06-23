
import React from 'react';
import { Project } from '@/types/database';
import { getUnifiedLifecycleStatus } from '@/utils/unified-lifecycle-utils';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { UNIFIED_STATUS_CONFIG } from '@/types/unified-lifecycle';

interface ProjectStatusDisplayProps {
  project: Project;
  showProgression?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  interactive?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export const ProjectStatusDisplay: React.FC<ProjectStatusDisplayProps> = ({ 
  project, 
  showProgression = false,
  size = 'md',
  showIcon = true,
  interactive = false,
  onStatusChange
}) => {
  const unifiedStatus = getUnifiedLifecycleStatus(project);
  const statusConfig = UNIFIED_STATUS_CONFIG[unifiedStatus];
  
  // Calculate progression percentage based on status order
  const progressionPercentage = Math.round((statusConfig.order / 7) * 100);

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <GlobalStatusDropdown
        entityType="project"
        currentStatus={unifiedStatus}
        onStatusChange={handleStatusChange}
        showAsDropdown={interactive}
        size={size}
        disabled={!interactive}
      />
      {showProgression && (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          ({progressionPercentage}%)
        </span>
      )}
    </div>
  );
};

export default ProjectStatusDisplay;
