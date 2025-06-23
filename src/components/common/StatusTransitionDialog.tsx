
import React from 'react';
import { ResponsiveDialog } from './ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { LifecycleStatusBadge } from '@/components/ui/lifecycle-status-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { LifecycleStatus } from '@/types/database';
import { checkTransitionPrerequisites } from '@/types/projectStatus';

interface StatusTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: LifecycleStatus;
  targetStatus: LifecycleStatus;
  project: any;
  tasks?: any[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export const StatusTransitionDialog = ({
  open,
  onOpenChange,
  currentStatus,
  targetStatus,
  project,
  tasks = [],
  onConfirm,
  isLoading = false
}: StatusTransitionDialogProps) => {
  const prerequisiteCheck = checkTransitionPrerequisites(
    currentStatus,
    targetStatus,
    project,
    tasks
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Status Transition"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Status Transition Visual */}
        <div className="flex items-center justify-center space-x-3 py-4">
          <LifecycleStatusBadge status={currentStatus} />
          <ArrowRight className="h-5 w-5 text-slate-400" />
          <LifecycleStatusBadge status={targetStatus} />
        </div>

        {/* Prerequisites Warning */}
        {!prerequisiteCheck.canTransition && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Cannot transition:</strong> {prerequisiteCheck.warning}
            </AlertDescription>
          </Alert>
        )}

        {/* Prerequisites Info */}
        {prerequisiteCheck.canTransition && prerequisiteCheck.warning && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Note:</strong> {prerequisiteCheck.warning}
            </AlertDescription>
          </Alert>
        )}

        {/* Project Info */}
        <div className="text-sm text-slate-600 space-y-1">
          <p><strong>Project:</strong> {project.name}</p>
          <p><strong>Progress:</strong> {project.progress || 0}%</p>
          <p><strong>Tasks:</strong> {tasks.length} total</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!prerequisiteCheck.canTransition || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Updating...' : 'Confirm Transition'}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
