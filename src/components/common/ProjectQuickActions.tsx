
import { useState } from 'react';
import { Project } from '@/types/database';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { AssignStakeholderDialog } from '@/components/stakeholders/AssignStakeholderDialog';
import { AssignEquipmentToProjectDialog } from '@/components/dashboard/AssignEquipmentToProjectDialog';
import { StatusTransitionDialog } from '@/components/common/StatusTransitionDialog';
import { SubscriptionErrorBoundary } from '@/components/common/SubscriptionErrorBoundary';
import { useQuickActions } from './quick-actions/useQuickActions';
import { CompactActions } from './quick-actions/variants/CompactActions';
import { InlineActions } from './quick-actions/variants/InlineActions';
import { FloatingActions } from './quick-actions/variants/FloatingActions';
import { ActionContext, ActionVariant } from './quick-actions/types';
import { getLifecycleStatus, getNextLifecycleStatus, canAdvanceLifecycleStatus } from '@/utils/lifecycle-status';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

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
  const [assignEquipmentOpen, setAssignEquipmentOpen] = useState(false);
  const [statusTransitionOpen, setStatusTransitionOpen] = useState(false);

  const { tasks } = useTasks({ projectId: project.id });
  const { updateProject } = useProjects();

  const currentLifecycleStatus = getLifecycleStatus(project);
  const nextLifecycleStatus = getNextLifecycleStatus(currentLifecycleStatus);
  const canAdvance = canAdvanceLifecycleStatus(project, tasks);

  const handleStatusTransition = () => {
    if (nextLifecycleStatus && canAdvance) {
      setStatusTransitionOpen(true);
    }
  };

  const handleConfirmStatusTransition = async () => {
    if (nextLifecycleStatus) {
      console.log(`🔄 Advancing project "${project.name}" from ${currentLifecycleStatus} to ${nextLifecycleStatus}`);
      
      await updateProject(project.id, {
        lifecycle_status: nextLifecycleStatus
      });
      
      setStatusTransitionOpen(false);
    }
  };

  const { actions, primaryAction, secondaryActions } = useQuickActions({
    project,
    context,
    onCreateTask: () => setCreateTaskOpen(true),
    onAssignStakeholder: () => setAssignStakeholderOpen(true),
    onAssignEquipment: () => setAssignEquipmentOpen(true),
    onAdvanceStatus: nextLifecycleStatus && canAdvance ? handleStatusTransition : undefined
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

      <SubscriptionErrorBoundary tableName="equipment">
        <AssignEquipmentToProjectDialog
          project={project}
          open={assignEquipmentOpen}
          onOpenChange={setAssignEquipmentOpen}
          onSuccess={() => {
            // Equipment assignment completed
          }}
        />
      </SubscriptionErrorBoundary>

      {nextLifecycleStatus && (
        <StatusTransitionDialog
          open={statusTransitionOpen}
          onOpenChange={setStatusTransitionOpen}
          currentStatus={currentLifecycleStatus}
          targetStatus={nextLifecycleStatus}
          project={project}
          tasks={tasks}
          onConfirm={handleConfirmStatusTransition}
        />
      )}
    </>
  );
};
