
import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
      <ConfirmationDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Access Denied"
        description="You don't have permission to delete projects. Only administrators and project managers can delete projects."
        confirmText="OK"
        onConfirm={() => onOpenChange(false)}
        variant="default"
      />
    );
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Delete Project"
      description=""
      confirmText="Delete Project"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={handleConfirm}
      loading={loading}
    >
      <div className="space-y-4">
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
      </div>
    </ConfirmationDialog>
  );
};
