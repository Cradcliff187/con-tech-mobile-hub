
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  ListChecks,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateAutoPunchListItems, calculatePhaseReadiness } from '@/utils/phase-automation';

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
  const { projects } = useProjects();
  const { tasks, createTask } = useTasks();
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [targetPhase, setTargetPhase] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const project = projectId ? projects.find(p => p.id === projectId) : null;
  const projectTasks = projectId ? tasks.filter(t => t.project_id === projectId) : [];

  if (!project) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <Target className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-slate-600">Select a project to view phase management</p>
      </div>
    );
  }

  const phaseReadiness = calculatePhaseReadiness(project, projectTasks);

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

    setIsUpdating(true);
    const punchListItems = generateAutoPunchListItems(projectTasks);
    
    try {
      for (const item of punchListItems) {
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
        
        if (error) throw error;
      }
      
      toast.success(`Generated ${punchListItems.length} punch list items`);
      
    } catch (error) {
      console.error('Error generating punch list:', error);
      toast.error('Failed to generate punch list items');
    }
    setIsUpdating(false);
  };

  const handlePhaseTransition = async () => {
    if (!projectId || !targetPhase) return;

    setIsUpdating(true);
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
      toast.error('Failed to update project phase');
    }
    setIsUpdating(false);
  };

  const readiness = calculatePhaseReadinessLegacy();
  const punchListTasks = projectTasks.filter(t => t.task_type === 'punch_list');

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'planning': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'punch_list': return 'bg-orange-500';
      case 'closeout': return 'bg-purple-500';
      case 'completed': return 'bg-slate-500';
      default: return 'bg-slate-400';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'planning': return Clock;
      case 'active': return Target;
      case 'punch_list': return ListChecks;
      case 'closeout': return CheckCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const PhaseIcon = getPhaseIcon(readiness.currentPhase);

  return (
    <div className="space-y-6">
      {/* Current Phase Status */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getPhaseColor(readiness.currentPhase)} text-white`}>
              <PhaseIcon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {readiness.currentPhase.replace('_', ' ').toUpperCase()} PHASE
              </h3>
              <p className="text-sm text-slate-600">
                {Math.round(phaseReadiness.readinessScore)}% Complete
              </p>
            </div>
          </div>
          
          <Badge variant={readiness.canAdvance ? 'default' : 'secondary'}>
            {readiness.canAdvance ? 'Ready to Advance' : 'In Progress'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Phase Progress</span>
            <span className="font-medium">{Math.round(phaseReadiness.readinessScore)}%</span>
          </div>
          <Progress value={phaseReadiness.readinessScore} className="h-3" />
        </div>

        {/* Phase Transition Actions */}
        {readiness.canAdvance && readiness.nextPhase && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-green-800 font-medium">
                  Ready to advance to {readiness.nextPhase.replace('_', ' ')} phase
                </span>
              </div>
              <Button
                onClick={() => {
                  setTargetPhase(readiness.nextPhase!);
                  setShowTransitionDialog(true);
                }}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <ArrowRight size={16} className="mr-1" />
                Advance Phase
              </Button>
            </div>
          </div>
        )}

        {/* Punch List Generation */}
        {phaseReadiness.shouldGeneratePunchList && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks size={16} className="text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Ready to generate punch list items
                </span>
              </div>
              <Button
                onClick={handleGeneratePunchList}
                disabled={isUpdating}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <ListChecks size={16} className="mr-1" />
                Generate Punch List
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Phase Requirements */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h4 className="font-semibold text-slate-800 mb-4">Phase Requirements</h4>
        <div className="space-y-2">
          {readiness.requirements.map((requirement, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-slate-600 text-sm">{requirement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {readiness.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {readiness.recommendations.map((rec, index) => (
                <li key={index} className="text-sm">• {rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Phase Transition Dialog */}
      <Dialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Phase Transition</DialogTitle>
            <DialogDescription>
              Are you sure you want to advance the project from{' '}
              <span className="font-medium">{readiness.currentPhase.replace('_', ' ')}</span> to{' '}
              <span className="font-medium">{targetPhase.replace('_', ' ')}</span> phase?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransitionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePhaseTransition}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
