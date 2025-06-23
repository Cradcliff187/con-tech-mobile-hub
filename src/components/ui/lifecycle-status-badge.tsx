
import React from 'react';
import { Badge } from './badge';
import { 
  Settings, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  ListChecks, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { LifecycleStatus } from '@/types/database';
import { getStatusMetadata } from '@/types/projectStatus';

interface LifecycleStatusBadgeProps {
  status: LifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const getStatusIcon = (status: LifecycleStatus, size: number = 14) => {
  const iconProps = { size, className: 'mr-1.5' };
  
  switch (status) {
    case 'pre_planning':
      return <Settings {...iconProps} />;
    case 'planning_active':
      return <Clock {...iconProps} />;
    case 'construction_active':
      return <PlayCircle {...iconProps} />;
    case 'construction_hold':
      return <PauseCircle {...iconProps} />;
    case 'punch_list_phase':
      return <ListChecks {...iconProps} />;
    case 'project_closeout':
    case 'project_completed':
      return <CheckCircle {...iconProps} />;
    case 'project_cancelled':
      return <XCircle {...iconProps} />;
    default:
      return null;
  }
};

export const LifecycleStatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: LifecycleStatusBadgeProps) => {
  const metadata = getStatusMetadata(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <Badge 
      className={`
        ${metadata.color} 
        ${metadata.textColor} 
        ${sizeClasses[size]} 
        inline-flex items-center font-medium border-0
        ${className}
      `}
    >
      {showIcon && getStatusIcon(status, iconSize[size])}
      {metadata.label}
    </Badge>
  );
};

export default LifecycleStatusBadge;
