
import React from 'react';
import { Project } from '@/types/database';
import { getLifecycleStatus } from '@/utils/lifecycle-status';
import { LifecycleStatusBadge } from '@/components/ui/lifecycle-status-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface TaskProjectStatusFieldProps {
  project?: Project;
  taskType?: string;
}

export const TaskProjectStatusField = ({ 
  project, 
  taskType = 'regular' 
}: TaskProjectStatusFieldProps) => {
  if (!project) return null;

  const lifecycleStatus = getLifecycleStatus(project);
  
  // Show relevant information based on project status
  const getStatusInfo = () => {
    if (taskType === 'punch_list' && lifecycleStatus !== 'punch_list_phase') {
      return {
        type: 'warning' as const,
        message: 'Punch list tasks are typically created during the Punch List phase.'
      };
    }
    
    if (lifecycleStatus === 'project_completed') {
      return {
        type: 'info' as const,
        message: 'This project has been completed. New tasks may not be actionable.'
      };
    }
    
    if (lifecycleStatus === 'project_cancelled') {
      return {
        type: 'warning' as const,
        message: 'This project has been cancelled. Task creation may not be appropriate.'
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Project Status</span>
        <LifecycleStatusBadge status={lifecycleStatus} size="sm" />
      </div>
      
      {statusInfo && (
        <Alert className={`${statusInfo.type === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {statusInfo.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
