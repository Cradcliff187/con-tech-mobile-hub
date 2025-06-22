
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types/database';

interface ProjectSelectionFieldProps {
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
  projects: Project[];
  isUploading: boolean;
  currentProjectId?: string;
}

export const ProjectSelectionField: React.FC<ProjectSelectionFieldProps> = ({
  selectedProjectId,
  onProjectSelect,
  projects,
  isUploading,
  currentProjectId
}) => {
  // Only show project selection if we don't have a current project
  if (currentProjectId) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <Label className="text-slate-700 font-medium">Project</Label>
      <Select value={selectedProjectId} onValueChange={onProjectSelect} disabled={isUploading}>
        <SelectTrigger className="mt-1 transition-all duration-200 hover:border-slate-400">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
