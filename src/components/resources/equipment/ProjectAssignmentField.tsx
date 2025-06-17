
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';

interface ProjectAssignmentFieldProps {
  projectId: string;
  setProjectId: (value: string) => void;
  disabled?: boolean;
}

export const ProjectAssignmentField = ({
  projectId,
  setProjectId,
  disabled = false
}: ProjectAssignmentFieldProps) => {
  const { projects } = useProjects();

  return (
    <div className="space-y-2">
      <Label htmlFor="edit-project">Assigned Project</Label>
      <Select value={projectId} onValueChange={setProjectId} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select a project (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No Project</SelectItem>
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
