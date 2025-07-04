
import { useMemo } from 'react';
import { Plus, Calendar, Users, CheckCircle, FileText, MoreHorizontal, Wrench, Upload, FolderOpen, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types/database';
import { QuickAction, ActionContext } from './types';

interface UseQuickActionsProps {
  project: Project;
  context: ActionContext;
  onCreateTask: () => void;
  onAssignStakeholder: () => void;
  onAssignEquipment?: () => void;
  onAdvanceStatus?: () => void;
}

export const useQuickActions = ({ 
  project, 
  context, 
  onCreateTask, 
  onAssignStakeholder,
  onAssignEquipment,
  onAdvanceStatus
}: UseQuickActionsProps) => {
  const navigate = useNavigate();

  const actions = useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        id: 'create-task',
        label: 'Create Task',
        icon: Plus,
        action: onCreateTask,
        shortcut: 'Ctrl+N',
        primary: context !== 'documents'
      },
      {
        id: 'assign-stakeholder',
        label: 'Assign Stakeholder',
        icon: Users,
        action: onAssignStakeholder,
        shortcut: 'Ctrl+U'
      }
    ];

    // Add equipment assignment action for project contexts
    if (onAssignEquipment && (context === 'dashboard' || context === 'planning')) {
      baseActions.push({
        id: 'assign-equipment',
        label: 'Assign Equipment',
        icon: Wrench,
        action: onAssignEquipment,
        shortcut: 'Ctrl+E'
      });
    }

    // Add advance status action if available
    if (onAdvanceStatus) {
      baseActions.push({
        id: 'advance-status',
        label: 'Advance Status',
        icon: CheckCircle,
        action: onAdvanceStatus,
        shortcut: 'Ctrl+A',
        primary: context === 'dashboard'
      });
    }

    // Document-related actions - prioritize for document context
    const documentActions: QuickAction[] = [
      {
        id: 'upload-document',
        label: 'Upload Document',
        icon: Upload,
        action: () => navigate(`/?section=documents&project=${project.id}`),
        shortcut: 'Ctrl+D',
        primary: context === 'documents'
      },
      {
        id: 'view-documents',
        label: 'View Documents',
        icon: FolderOpen,
        action: () => navigate(`/?section=documents&project=${project.id}`),
        shortcut: 'Ctrl+Shift+D'
      }
    ];

    // Phase-specific document actions
    if (project.phase === 'planning') {
      documentActions.push({
        id: 'upload-plans',
        label: 'Upload Plans',
        icon: FileText,
        action: () => navigate(`/?section=documents&project=${project.id}&category=plans`),
        badge: 'Required',
        variant: 'secondary' as const
      });
    }

    if (project.phase === 'active') {
      documentActions.push({
        id: 'progress-photos',
        label: 'Progress Photos',
        icon: Camera,
        action: () => navigate(`/?section=documents&project=${project.id}&category=photos`),
        badge: 'Active',
        variant: 'default' as const
      });
    }

    if (project.phase === 'completed' || project.phase === 'punch_list') {
      documentActions.push({
        id: 'completion-docs',
        label: 'Completion Docs',
        icon: CheckCircle,
        action: () => navigate(`/?section=documents&project=${project.id}&category=reports`),
        badge: 'Final',
        variant: 'destructive' as const
      });
    }

    // Prioritize document actions for document context
    if (context === 'documents') {
      baseActions.unshift(...documentActions);
    } else {
      baseActions.push(...documentActions);
    }

    baseActions.push({
      id: 'view-timeline',
      label: 'View Timeline',
      icon: Calendar,
      action: () => navigate(`/?section=timeline&project=${project.id}`),
      shortcut: 'Ctrl+T'
    });

    // Phase-specific actions
    const phaseActions: QuickAction[] = [];
    
    if (project.phase === 'active' && project.progress > 80) {
      phaseActions.push({
        id: 'generate-punch-list',
        label: 'Generate Punch List',
        icon: CheckCircle,
        action: () => navigate(`/?section=planning&project=${project.id}`),
        badge: 'Ready',
        variant: 'secondary' as const
      });
    }

    if (project.phase === 'punch_list') {
      phaseActions.push({
        id: 'quality-inspection',
        label: 'Quality Inspection',
        icon: FileText,
        action: () => navigate(`/?section=tasks&project=${project.id}&filter=punch_list`),
        badge: 'Active',
        variant: 'destructive' as const
      });
    }

    // Context-specific actions
    const contextActions: QuickAction[] = [];
    
    switch (context) {
      case 'planning':
        contextActions.push({
          id: 'resource-planning',
          label: 'Resource Planning',
          icon: Users,
          action: () => navigate(`/?section=planning&project=${project.id}&tab=resources`)
        });
        contextActions.push({
          id: 'equipment-view',
          label: 'Equipment Overview',
          icon: Wrench,
          action: () => navigate(`/?section=resources&project=${project.id}&tab=equipment`)
        });
        break;
      case 'tasks':
        contextActions.push({
          id: 'bulk-actions',
          label: 'Bulk Task Actions',
          icon: MoreHorizontal,
          action: () => {
            // This will be handled by the TaskManager component
            const event = new CustomEvent('openBulkActions');
            window.dispatchEvent(event);
          }
        });
        break;
      case 'dashboard':
        contextActions.push({
          id: 'project-overview',
          label: 'Project Overview',
          icon: FileText,
          action: () => navigate(`/?project=${project.id}`)
        });
        break;
      case 'documents':
        // Document-specific actions are already added above
        break;
    }

    return [...baseActions, ...phaseActions, ...contextActions];
  }, [project, context, navigate, onCreateTask, onAssignStakeholder, onAssignEquipment, onAdvanceStatus]);

  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return { actions, primaryAction, secondaryActions };
};
