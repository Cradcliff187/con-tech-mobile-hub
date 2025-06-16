
import { Project } from '@/types/database';
import { ProjectQuickActions } from './ProjectQuickActions';

interface InlineProjectActionsProps {
  project: Project;
  context?: 'dashboard' | 'planning' | 'tasks';
  className?: string;
}

export const InlineProjectActions = ({ project, context, className }: InlineProjectActionsProps) => {
  return (
    <ProjectQuickActions 
      project={project} 
      context={context} 
      variant="inline"
      className={className}
    />
  );
};
