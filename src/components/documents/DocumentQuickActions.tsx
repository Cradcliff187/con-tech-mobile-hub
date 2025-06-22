
import React from 'react';
import { Camera, FolderOpen } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Project } from '@/types/database';
import { SmartUploadButton } from './SmartUploadButton';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { QuickActionButton } from '@/components/common/quick-actions/QuickActionButton';
import { QuickAction } from '@/components/common/quick-actions/types';

interface DocumentQuickActionsProps {
  project?: Project;
  variant?: 'floating' | 'inline' | 'compact';
  className?: string;
}

export const DocumentQuickActions: React.FC<DocumentQuickActionsProps> = ({
  project,
  variant = 'inline',
  className
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { canUpload, refetch } = useDocuments(project?.id);

  const handleUploadComplete = () => {
    refetch();
  };

  const getPhaseSpecificActions = (): QuickAction[] => {
    if (!project) return [];

    const actions: QuickAction[] = [];

    switch (project.phase) {
      case 'planning':
        actions.push({
          id: 'upload-plans',
          label: 'Upload Plans',
          icon: Camera,
          action: () => {
            const params = new URLSearchParams(searchParams);
            params.set('category', 'plans');
            navigate(`/?section=documents&project=${project.id}&${params.toString()}`);
          },
          badge: 'Required',
          variant: 'secondary'
        });
        break;

      case 'active':
        actions.push({
          id: 'progress-photos',
          label: 'Progress Photos',
          icon: Camera,
          action: () => {
            const params = new URLSearchParams(searchParams);
            params.set('category', 'photos');
            navigate(`/?section=documents&project=${project.id}&${params.toString()}`);
          },
          badge: 'Active',
          primary: true
        });
        break;

      case 'completed':
      case 'punch_list':
        actions.push({
          id: 'final-docs',
          label: 'Final Documents',
          icon: Camera,
          action: () => {
            const params = new URLSearchParams(searchParams);
            params.set('category', 'reports');
            navigate(`/?section=documents&project=${project.id}&${params.toString()}`);
          },
          badge: 'Required',
          variant: 'destructive'
        });
        break;
    }

    return actions;
  };

  const phaseActions = getPhaseSpecificActions();

  if (!canUpload()) {
    return (
      <div className="flex items-center gap-2 text-slate-500 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <FolderOpen size={20} />
        <span className="text-sm">Document upload restricted. Contact your project manager for access.</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <SmartUploadButton
          projectId={project?.id}
          onUploadComplete={handleUploadComplete}
          variant="compact"
          size="sm"
        />
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <SmartUploadButton
          projectId={project?.id}
          onUploadComplete={handleUploadComplete}
          variant="floating"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 lg:gap-3 ${className}`}>
      {phaseActions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          variant={action.primary ? 'default' : 'outline'}
          className="min-h-[44px]"
          showBadge
        />
      ))}
      
      <SmartUploadButton
        projectId={project?.id}
        onUploadComplete={handleUploadComplete}
        variant="default"
        size="default"
      />
    </div>
  );
};
