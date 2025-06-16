
import { useMemo } from 'react';
import { Plus, Calendar, Users, CheckCircle, FileText, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types/database';
import { QuickAction, ActionContext } from './types';

interface UseQuickActionsProps {
  project: Project;
  context: ActionContext;
  onCreateTask: () => void;
  onAssignStakeholder: () => void;
}

export const useQuickActions = ({ 
  project, 
  context, 
  onCreateTask, 
  onAssignStakeholder 
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
        primary: true
      },
      {
        id: 'assign-stakeholder',
        label: 'Assign Stakeholder',
        icon: Users,
        action: onAssignStakeholder,
        shortcut: 'Ctrl+U'
      },
      {
        id: 'view-timeline',
        label: 'View Timeline',
        icon: Calendar,
        action: () => navigate(`/?section=timeline&project=${project.id}`),
        shortcut: 'Ctrl+T'
      }
    ];

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
    }

    return [...baseActions, ...phaseActions, ...contextActions];
  }, [project, context, navigate, onCreateTask, onAssignStakeholder]);

  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return { actions, primaryAction, secondaryActions };
};
