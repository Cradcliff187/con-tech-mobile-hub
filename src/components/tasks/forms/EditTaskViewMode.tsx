
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { TaskDocumentAttachments } from '../TaskDocumentAttachments';
import { TaskViewHeader } from './view/TaskViewHeader';
import { TaskViewProgress } from './view/TaskViewProgress';
import { TaskViewDetails } from './view/TaskViewDetails';
import { TaskViewTimestamps } from './view/TaskViewTimestamps';
import { Task } from '@/types/database';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';

interface EditTaskViewModeProps {
  task: Task;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

export const EditTaskViewMode: React.FC<EditTaskViewModeProps> = ({
  task,
  onClose,
  onSwitchToEdit
}) => {
  const { sessionError, canAssignToProject } = useProjectPermissions();
  const canAssign = canAssignToProject(task.project_id);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Session Error Alert */}
      {sessionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Authentication Issue: {sessionError}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="ml-2 h-6 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Warning for Assignment */}
      {!canAssign && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You may have limited editing permissions for this task. If you experience issues, try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <TaskViewHeader task={task} />

      {/* Progress Section */}
      <TaskViewProgress task={task} />

      {/* Task Details Grid */}
      <TaskViewDetails task={task} />

      {/* Document Attachments */}
      <div>
        <h4 className="text-sm font-medium text-slate-800 mb-3">Document Attachments</h4>
        <TaskDocumentAttachments task={task} />
      </div>

      {/* Timestamps */}
      <TaskViewTimestamps task={task} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
        >
          Close
        </Button>
        <Button 
          type="button" 
          onClick={onSwitchToEdit}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-300"
        >
          Switch to Edit
        </Button>
      </div>
    </div>
  );
};
