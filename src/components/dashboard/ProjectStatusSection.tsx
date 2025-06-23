
import React from 'react';
import { Project } from '@/types/database';
import { ProjectStatusDisplay } from './ProjectStatusDisplay';
import { getLifecycleStatus, canAdvanceLifecycleStatus } from '@/utils/lifecycle-status';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ProjectStatusSectionProps {
  project: Project;
  tasks: any[];
  onAdvanceStatus?: () => void;
  compact?: boolean;
}

export const ProjectStatusSection = ({
  project,
  tasks,
  onAdvanceStatus,
  compact = false
}: ProjectStatusSectionProps) => {
  const lifecycleStatus = getLifecycleStatus(project);
  const canAdvance = canAdvanceLifecycleStatus(project, tasks);

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <ProjectStatusDisplay project={project} size="sm" />
        {canAdvance && onAdvanceStatus && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdvanceStatus}
            className="text-xs p-1"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900">Project Status</h4>
        <ProjectStatusDisplay project={project} showProgression />
      </div>
      
      {canAdvance && onAdvanceStatus && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAdvanceStatus}
          className="w-full"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Advance Status
        </Button>
      )}
    </div>
  );
};
