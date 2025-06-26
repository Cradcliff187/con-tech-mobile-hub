
import { useCallback } from 'react';
import { Project } from '@/types/database';

interface ReassignmentDefaults {
  category: string;
  requiredSkills: string[];
  estimatedHours?: number;
}

interface UseProjectReassignmentDefaultsProps {
  projects: Project[];
  onApplyDefaults: (defaults: ReassignmentDefaults) => void;
}

export const useProjectReassignmentDefaults = ({ 
  projects, 
  onApplyDefaults 
}: UseProjectReassignmentDefaultsProps) => {
  
  const applyProjectDefaults = useCallback((newProjectId: string, currentProjectId?: string) => {
    if (newProjectId === currentProjectId) return;

    const newProject = projects.find(p => p.id === newProjectId);
    if (!newProject) return;

    // Smart defaults based on project phase and type
    const defaults: ReassignmentDefaults = {
      category: getDefaultCategoryForProject(newProject),
      requiredSkills: [],
      estimatedHours: getDefaultHoursForProject(newProject)
    };

    onApplyDefaults(defaults);
  }, [projects, onApplyDefaults]);

  const getDefaultCategoryForProject = (project: Project): string => {
    // Reset category when changing projects as different projects may have different contexts
    const phase = project.unified_lifecycle_status || project.phase;
    
    switch (phase) {
      case 'pre_construction':
      case 'planning':
        return 'Foundation';
      case 'mobilization':
        return 'Setup';
      case 'construction':
      case 'active':
        return 'Framing';
      case 'punch_list':
        return 'Cleanup';
      case 'closeout':
        return 'Inspection';
      default:
        return '';
    }
  };

  const getDefaultHoursForProject = (project: Project): number | undefined => {
    // Provide estimated hours based on project phase
    const phase = project.unified_lifecycle_status || project.phase;
    
    switch (phase) {
      case 'pre_construction':
      case 'planning':
        return 4;
      case 'construction':
      case 'active':
        return 8;
      case 'punch_list':
        return 2;
      default:
        return undefined;
    }
  };

  return { applyProjectDefaults };
};
