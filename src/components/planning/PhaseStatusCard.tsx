
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ListChecks,
  Target,
  Settings,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { LifecycleStatus } from '@/types/database';
import { 
  getLifecycleStatusLabel, 
  getLifecycleStatusColor,
  getNextLifecycleStatus 
} from '@/utils/lifecycle-status';

interface PhaseStatusCardProps {
  currentLifecycleStatus: LifecycleStatus;
  readinessScore: number;
  canAdvance: boolean;
  shouldGeneratePunchList: boolean;
  isUpdating: boolean;
  onAdvancePhase: (lifecycleStatus: LifecycleStatus) => void;
  onGeneratePunchList: () => void;
}

export const PhaseStatusCard = ({
  currentLifecycleStatus,
  readinessScore,
  canAdvance,
  shouldGeneratePunchList,
  isUpdating,
  onAdvancePhase,
  onGeneratePunchList
}: PhaseStatusCardProps) => {
  const nextLifecycleStatus = getNextLifecycleStatus(currentLifecycleStatus);

  const getPhaseIcon = (lifecycleStatus: LifecycleStatus) => {
    switch (lifecycleStatus) {
      case 'pre_planning':
        return Settings;
      case 'planning_active':
        return Clock;
      case 'construction_active':
        return PlayCircle;
      case 'construction_hold':
        return PauseCircle;
      case 'punch_list_phase':
        return ListChecks;
      case 'project_closeout':
        return CheckCircle;
      case 'project_completed':
        return CheckCircle;
      case 'project_cancelled':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const PhaseIcon = getPhaseIcon(currentLifecycleStatus);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getLifecycleStatusColor(currentLifecycleStatus)} text-white`}>
            <PhaseIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {getLifecycleStatusLabel(currentLifecycleStatus).toUpperCase()}
            </h3>
            <p className="text-sm text-slate-600">
              {Math.round(readinessScore)}% Complete
            </p>
          </div>
        </div>
        
        <Badge variant={canAdvance ? 'default' : 'secondary'}>
          {canAdvance ? 'Ready to Advance' : 'In Progress'}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Phase Progress</span>
          <span className="font-medium">{Math.round(readinessScore)}%</span>
        </div>
        <Progress value={readinessScore} className="h-3" />
      </div>

      {/* Phase Transition Actions */}
      {canAdvance && nextLifecycleStatus && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-800 font-medium">
                Ready to advance to {getLifecycleStatusLabel(nextLifecycleStatus)}
              </span>
            </div>
            <Button
              onClick={() => onAdvancePhase(nextLifecycleStatus)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={isUpdating}
            >
              <ArrowRight size={16} className="mr-1" />
              Advance Phase
            </Button>
          </div>
        </div>
      )}

      {/* Punch List Generation */}
      {shouldGeneratePunchList && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-orange-600" />
              <span className="text-orange-800 font-medium">
                Ready to generate punch list items
              </span>
            </div>
            <Button
              onClick={onGeneratePunchList}
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
  );
};
