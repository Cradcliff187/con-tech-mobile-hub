
import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Project } from '@/types/database';

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export const DeleteProjectDialog = ({ open, onOpenChange, project }: DeleteProjectDialogProps) => {
  const { deleteProject } = useProjects();
  const { profile } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user can delete projects (admin or project manager)
  const canDelete = profile?.is_company_user && 
                   profile?.account_status === 'approved' && 
                   (profile?.role === 'admin' || profile?.role === 'project_manager');

  const isConfirmationValid = confirmationText === project?.name;

  const handleConfirm = async () => {
    if (!canDelete || !isConfirmationValid) return;

    setLoading(true);
    const { error } = await deleteProject(project.id);
    
    if (!error) {
      onOpenChange(false);
      setConfirmationText('');
    }
    
    setLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText('');
    }
    onOpenChange(open);
  };

  if (!canDelete) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Access Denied"
      >
        <div className="p-4 text-center">
          <p className="text-slate-600 mb-4">
            You don't have permission to delete projects. Only administrators and project managers can delete projects.
          </p>
          <Button onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </div>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Delete Project"
      className="max-w-md"
    >
      <div className="space-y-4 p-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action cannot be undone. Deleting this project will permanently remove:
          </AlertDescription>
        </Alert>
        
        <ul className="text-sm text-slate-600 space-y-1 ml-4">
          <li>• All project data and settings</li>
          <li>• Associated tasks and assignments</li>
          <li>• Resource allocations and schedules</li>
          <li>• Project documents and files</li>
          <li>• Communication history</li>
        </ul>

        <div className="space-y-2">
          <Label htmlFor="confirmation" className="text-sm font-medium">
            To confirm deletion, type the project name: <span className="font-bold">{project?.name}</span>
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Enter project name to confirm"
            className="border-red-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        {confirmationText && !isConfirmationValid && (
          <p className="text-sm text-red-600">
            Project name doesn't match. Please type "{project?.name}" exactly.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !isConfirmationValid}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Project'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
