
import { useState } from 'react';
import { Project } from '@/types/database';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { AssignStakeholderDialog } from '@/components/stakeholders/AssignStakeholderDialog';
import { useQuickActions } from './quick-actions/useQuickActions';
import { CompactActions } from './quick-actions/variants/CompactActions';
import { InlineActions } from './quick-actions/variants/InlineActions';
import { FloatingActions } from './quick-actions/variants/FloatingActions';
import { ActionContext, ActionVariant } from './quick-actions/types';

interface ProjectQuickActionsProps {
  project: Project;
  context?: ActionContext;
  variant?: ActionVariant;
  className?: string;
}

export const ProjectQuickActions = ({ 
  project, 
  context = 'dashboard', 
  variant = 'floating',
  className 
}: ProjectQuickActionsProps) => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [assignStakeholderOpen, setAssignStakeholderOpen] = useState(false);

  const { actions, primaryAction, secondaryActions } = useQuickActions({
    project,
    context,
    onCreateTask: () => setCreateTaskOpen(true),
    onAssignStakeholder: () => setAssignStakeholderOpen(true)
  });

  const renderVariant = () => {
    switch (variant) {
      case 'compact':
        return (
          <CompactActions
            primaryAction={primaryAction}
            secondaryActions={secondaryActions}
            className={className}
          />
        );
      case 'inline':
        return (
          <InlineActions
            actions={actions}
            className={className}
          />
        );
      case 'floating':
      default:
        return (
          <FloatingActions
            primaryAction={primaryAction}
            secondaryActions={secondaryActions}
            className={className}
          />
        );
    }
  };

  return (
    <>
      {renderVariant()}

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />
      
      <AssignStakeholderDialog
        open={assignStakeholderOpen}
        onOpenChange={setAssignStakeholderOpen}
        stakeholder={null}
      />
    </>
  );
};
