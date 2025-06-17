
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';

interface ReassignProjectFormProps {
  onSubmit: (data: { targetProjectId: string }) => void;
  isSubmitting: boolean;
}

export const ReassignProjectForm = ({ onSubmit, isSubmitting }: ReassignProjectFormProps) => {
  const [targetProjectId, setTargetProjectId] = useState('');
  const { projects } = useProjects();

  const handleSubmit = () => {
    onSubmit({ targetProjectId });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="target-project">Target Project</Label>
      <Select 
        value={targetProjectId} 
        onValueChange={setTargetProjectId}
        disabled={isSubmitting}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select target project..." />
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
