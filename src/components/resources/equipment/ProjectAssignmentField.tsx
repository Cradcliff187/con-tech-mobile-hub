
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { normalizeSelectValue } from '@/utils/selectHelpers';

interface ProjectAssignmentFieldProps {
  projectId: string;
  setProjectId: (value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export const ProjectAssignmentField = ({
  projectId,
  setProjectId,
  disabled = false,
  errors = {}
}: ProjectAssignmentFieldProps) => {
  const { projects } = useProjects();

  const getFieldErrorClass = (fieldName: string) => {
    return errors[fieldName] ? 'border-red-500 focus:border-red-500' : '';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="edit-project">Assigned Project</Label>
      <Select 
        value={normalizeSelectValue(projectId)} 
        onValueChange={setProjectId} 
        disabled={disabled}
      >
        <SelectTrigger className={getFieldErrorClass('project')}>
          <SelectValue placeholder="Select a project (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Project</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.project && (
        <p className="text-sm text-red-600">{errors.project}</p>
      )}
    </div>
  );
};
