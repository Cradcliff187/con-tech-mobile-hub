
import React from 'react';
import { Project } from '@/types/database';
import { getUnifiedLifecycleStatus } from '@/utils/unified-lifecycle-utils';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

interface TaskProjectLifecycleFieldProps {
  project?: Project;
  taskType?: 'regular' | 'punch_list';
}

export const TaskProjectLifecycleField: React.FC<TaskProjectLifecycleFieldProps> = ({ 
  project, 
  taskType = 'regular' 
}) => {
  if (!project) return null;

  const unifiedStatus = getUnifiedLifecycleStatus(project);
  
  // Show relevant information based on project status
  const getStatusInfo = () => {
    if (taskType === 'punch_list' && unifiedStatus !== 'punch_list') {
      return {
        type: 'warning' as const,
        message: 'Punch list tasks are typically created during the Punch List phase.'
      };
    }
    
    if (unifiedStatus === 'warranty') {
      return {
        type: 'info' as const,
        message: 'This project is in warranty period. New tasks may be warranty-related work.'
      };
    }
    
    if (unifiedStatus === 'cancelled') {
      return {
        type: 'warning' as const,
        message: 'This project has been cancelled. Task creation may not be appropriate.'
      };
    }
    
    if (unifiedStatus === 'closeout') {
      return {
        type: 'info' as const,
        message: 'Project is in closeout phase. Tasks should focus on final documentation and handover.'
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Project Status:</span>
          <GlobalStatusDropdown
            entityType="project"
            currentStatus={unifiedStatus}
            onStatusChange={() => {}} // Read-only in task form
            showAsDropdown={false}
            size="sm"
          />
        </div>
      </div>
      
      {statusInfo && (
        <Alert className={`${statusInfo.type === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
          {statusInfo.type === 'warning' ? 
            <AlertTriangle className="h-4 w-4 text-amber-600" /> : 
            <Info className="h-4 w-4 text-blue-600" />
          }
          <AlertDescription className={`text-sm ${statusInfo.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>
            {statusInfo.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TaskProjectLifecycleField;
