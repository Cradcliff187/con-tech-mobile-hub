
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Project } from '@/types/database';

interface ProjectSelectionFieldProps {
  value: string;
  onChange: (value: string) => void;
  projects: Project[];
  selectedProject?: Project;
  stakeholder?: Stakeholder;
}

export const ProjectSelectionField = ({ 
  value, 
  onChange, 
  projects, 
  selectedProject, 
  stakeholder 
}: ProjectSelectionFieldProps) => {
  return (
    <div>
      <Label htmlFor="project_id">Project *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-h-[44px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name} {project.phase && (
                <span className="text-xs text-slate-500 ml-2">({project.phase})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProject && stakeholder && (
        <p className="text-xs text-blue-600 mt-1">
          Smart defaults applied for {stakeholder.stakeholder_type} in {selectedProject.phase} phase
        </p>
      )}
    </div>
  );
};
