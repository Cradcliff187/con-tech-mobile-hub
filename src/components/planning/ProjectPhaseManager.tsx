
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useSearchParams } from 'react-router-dom';
import { Target, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateAutoPunchListItems, calculatePhaseReadiness } from '@/utils/phase-automation';
import { PhaseStatusCard } from './PhaseStatusCard';
import { PhaseTransitionDialog } from './PhaseTransitionDialog';
import { PhaseRequirements } from './PhaseRequirements';
import { PhaseRecommendations } from './PhaseRecommendations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhaseReadiness {
  currentPhase: string;
  completionPercentage: number;
  canAdvance: boolean;
  nextPhase: string | null;
  requirements: string[];
  recommendations: string[];
}

export const ProjectPhaseManager = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, createTask, loading: tasksLoading } = useTasks();
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [targetPhase, setTargetPhase] = useState<string>('');

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

  let phaseReadiness;
  try {
    phaseReadiness = calculatePhaseReadiness(project, projectTasks);
  } catch (error) {
    console.error('Error calculating phase readiness:', error);
    return (
      <ErrorFallback
        title="Phase Calculation Error"
        description="There was a problem calculating the project phase readiness."
        resetError={() => window.location.reload()}
      />
    );
  }

  const calculatePhaseReadinessLegacy = (): PhaseReadiness => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const budgetUsage = project.budget && project.spent 
      ? (project.spent / project.budget) * 100 
      : 0;

    let canAdvance = false;
    let nextPhase: string | null = null;
    let requirements: string[] = [];
    let recommendations: string[] = [];

    switch (project.phase) {
      case 'planning':
        nextPhase = 'active';
        canAdvance = totalTasks > 0 && project.budget && project.budget > 0;
        requirements = [
          'At least one task must be created',
          'Project budget must be set',
          'Start date should be defined'
        ];
        if (!canAdvance) {
          if (totalTasks === 0) recommendations.push('Create project tasks to begin execution');
          if (!project.budget) recommendations.push('Set project budget for resource planning');
        }
        break;

      case 'active':
        nextPhase = 'punch_list';
        canAdvance = phaseReadiness.canAdvanceToPunchList;
        requirements = [
          'At least 90% of tasks must be completed',
          'Major construction work should be finished'
        ];
        if (phaseReadiness.readinessScore >= 80 && phaseReadiness.readinessScore < 90) {
          recommendations.push('Project is nearing completion - prepare for punch list phase');
        }
        if (budgetUsage > 95) {
          recommendations.push('Budget usage is high - review remaining costs');
        }
        break;

      case 'punch_list':
        nextPhase = 'closeout';
        canAdvance = phaseReadiness.canAdvanceToCloseout;
        requirements = [
          'All punch list items must be completed',
          'Overall project completion should be 95%+'
        ];
        if (phaseReadiness.punchListTasks === 0) {
          recommendations.push('Generate punch list items for final quality checks');
        }
        break;

      case 'closeout':
        nextPhase = 'completed';
        canAdvance = completionPercentage >= 100;
        requirements = [
          'All tasks must be completed',
          'Final inspections should be passed',
          'Documentation should be complete'
        ];
        recommendations.push('Prepare final project documentation and client handover');
        break;

      case 'completed':
        requirements.push('Project is complete');
        break;
    }

    return {
      currentPhase: project.phase,
      completionPercentage,
      canAdvance,
      nextPhase,
      requirements,
      recommendations
    };
  };

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
    if (!projectId || !targetPhase) return;

    await phaseTransitionOperation.execute(async () => {
      try {
        const { error } = await supabase
          .from('projects')
          .update({ phase: targetPhase })
          .eq('id', projectId);

        if (error) throw error;

        toast.success(`Project advanced to ${targetPhase.replace('_', ' ')} phase`);
        setShowTransitionDialog(false);
        setTargetPhase('');
      } catch (error) {
        console.error('Error updating project phase:', error);
        throw error;
      }
    });
  };

  const readiness = calculatePhaseReadinessLegacy();

  const handleAdvancePhase = (phase: string) => {
    setTargetPhase(phase);
    setShowTransitionDialog(true);
  };

  const isUpdating = generatePunchListOperation.loading || phaseTransitionOperation.loading;

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
        currentPhase={readiness.currentPhase}
        readinessScore={phaseReadiness.readinessScore}
        canAdvance={readiness.canAdvance}
        nextPhase={readiness.nextPhase}
        shouldGeneratePunchList={phaseReadiness.shouldGeneratePunchList}
        isUpdating={isUpdating}
        onAdvancePhase={handleAdvancePhase}
        onGeneratePunchList={handleGeneratePunchList}
      />

      <PhaseRequirements requirements={readiness.requirements} />

      <PhaseRecommendations recommendations={readiness.recommendations} />

      <PhaseTransitionDialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
        currentPhase={readiness.currentPhase}
        targetPhase={targetPhase}
        isUpdating={phaseTransitionOperation.loading}
        onConfirm={handlePhaseTransition}
      />
    </div>
  );
};
