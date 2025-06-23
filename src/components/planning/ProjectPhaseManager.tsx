
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useSearchParams } from 'react-router-dom';
import { Target, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateAutoPunchListItems, calculatePhaseReadiness } from '@/utils/phase-automation-unified';
import { getLifecycleStatus, getLifecycleStatusLabel, getLegacyStatusFromLifecycle } from '@/utils/lifecycle-status';
import { PhaseStatusCard } from './PhaseStatusCard';
import { PhaseTransitionDialog } from './PhaseTransitionDialog';
import { PhaseRequirements } from './PhaseRequirements';
import { PhaseRecommendations } from './PhaseRecommendations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LifecycleStatus } from '@/types/database';

export const ProjectPhaseManager = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const { projects, loading: projectsLoading, updateProject } = useProjects();
  const { tasks, createTask, loading: tasksLoading } = useTasks();
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [targetLifecycleStatus, setTargetLifecycleStatus] = useState<LifecycleStatus>('pre_planning');

  const generatePunchListOperation = useAsyncOperation({
    successMessage: "",
    errorMessage: "Failed to generate punch list items. Please try again."
  });

  const phaseTransitionOperation = useAsyncOperation({
    successMessage: "",
    errorMessage: "Failed to update project phase. Please try again."
  });

  const project = projectId ? projects.find(p => p.id === projectId) : null;
  const projectTasks = projectId ? tasks.filter(t => t.project_id === projectId) : [];

  const loading = projectsLoading || tasksLoading;

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-lg p-6">
        <LoadingSpinner size="lg" text="Loading phase information..." className="mx-auto" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <Target className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-slate-600">Select a project to view phase management</p>
      </div>
    );
  }

  const currentLifecycleStatus = getLifecycleStatus(project);
  const phaseReadiness = calculatePhaseReadiness(project, projectTasks);

  const handleGeneratePunchList = async () => {
    if (!projectId) return;

    await generatePunchListOperation.execute(async () => {
      try {
        const punchListItems = generateAutoPunchListItems(projectTasks);
        
        const promises = punchListItems.map(async (item) => {
          const { error } = await createTask({
            title: item.title,
            description: item.description,
            project_id: item.project_id,
            task_type: item.task_type,
            punch_list_category: item.punch_list_category,
            priority: item.priority,
            status: item.status,
            converted_from_task_id: item.converted_from_task_id,
            inspection_status: item.inspection_status
          });
          
          if (error) throw new Error(`Failed to create task: ${item.title}`);
        });
        
        await Promise.all(promises);
        
        toast.success(`Generated ${punchListItems.length} punch list items`);
      } catch (error) {
        console.error('Error generating punch list:', error);
        throw error;
      }
    });
  };

  const handlePhaseTransition = async () => {
    if (!projectId || !targetLifecycleStatus) return;

    await phaseTransitionOperation.execute(async () => {
      try {
        // Get legacy status/phase for backward compatibility
        const legacyStatus = getLegacyStatusFromLifecycle(targetLifecycleStatus);
        
        // Update both lifecycle_status and legacy fields
        const { error } = await updateProject(projectId, {
          lifecycle_status: targetLifecycleStatus,
          status: legacyStatus.status,
          phase: legacyStatus.phase
        });

        if (error) throw error;

        toast.success(`Project advanced to ${getLifecycleStatusLabel(targetLifecycleStatus)}`);
        setShowTransitionDialog(false);
        setTargetLifecycleStatus('pre_planning');
      } catch (error) {
        console.error('Error updating project phase:', error);
        throw error;
      }
    });
  };

  const handleAdvancePhase = (lifecycleStatus: LifecycleStatus) => {
    setTargetLifecycleStatus(lifecycleStatus);
    setShowTransitionDialog(true);
  };

  const isUpdating = generatePunchListOperation.loading || phaseTransitionOperation.loading;

  // Generate phase requirements and recommendations based on lifecycle status
  const getPhaseRequirements = (): string[] => {
    switch (currentLifecycleStatus) {
      case 'pre_planning':
        return [
          'At least one task must be created',
          'Project budget must be set',
          'Start date should be defined'
        ];
      case 'planning_active':
        return [
          'Project planning should be substantially complete',
          'Key tasks should be defined and assigned',
          'Resource allocation should be planned'
        ];
      case 'construction_active':
        return [
          'At least 90% of tasks must be completed',
          'Major construction work should be finished'
        ];
      case 'punch_list_phase':
        return [
          'All punch list items must be completed',
          'Overall project completion should be 95%+'
        ];
      case 'project_closeout':
        return [
          'All tasks must be completed',
          'Final inspections should be passed',
          'Documentation should be complete'
        ];
      default:
        return ['Project phase requirements will appear here'];
    }
  };

  const getPhaseRecommendations = (): string[] => {
    switch (currentLifecycleStatus) {
      case 'pre_planning':
        if (projectTasks.length === 0) return ['Create project tasks to begin execution'];
        if (!project.budget) return ['Set project budget for resource planning'];
        return ['Define project timeline and key milestones'];
      case 'planning_active':
        return ['Review and finalize all project plans before starting construction'];
      case 'construction_active':
        if (phaseReadiness.readinessScore >= 80 && phaseReadiness.readinessScore < 90) {
          return ['Project is nearing completion - prepare for punch list phase'];
        }
        if (phaseReadiness.budgetUsage > 95) {
          return ['Budget usage is high - review remaining costs'];
        }
        return ['Monitor progress and quality regularly'];
      case 'punch_list_phase':
        if (phaseReadiness.punchListTasks === 0) {
          return ['Generate punch list items for final quality checks'];
        }
        return ['Complete all punch list items for project closeout'];
      case 'project_closeout':
        return ['Prepare final project documentation and client handover'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {(generatePunchListOperation.error || phaseTransitionOperation.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {generatePunchListOperation.error?.message || phaseTransitionOperation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      <PhaseStatusCard
        currentLifecycleStatus={currentLifecycleStatus}
        readinessScore={phaseReadiness.readinessScore}
        canAdvance={phaseReadiness.canAdvance}
        shouldGeneratePunchList={phaseReadiness.shouldGeneratePunchList}
        isUpdating={isUpdating}
        onAdvancePhase={handleAdvancePhase}
        onGeneratePunchList={handleGeneratePunchList}
      />

      <PhaseRequirements requirements={getPhaseRequirements()} />

      <PhaseRecommendations recommendations={getPhaseRecommendations()} />

      <PhaseTransitionDialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
        currentPhase={getLifecycleStatusLabel(currentLifecycleStatus)}
        targetPhase={getLifecycleStatusLabel(targetLifecycleStatus)}
        isUpdating={phaseTransitionOperation.loading}
        onConfirm={handlePhaseTransition}
      />
    </div>
  );
};
