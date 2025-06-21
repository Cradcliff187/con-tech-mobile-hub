
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
}

export const CreateProjectDialog = ({ 
  open, 
  onOpenChange, 
  defaultClientId 
}: CreateProjectDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    client_id: defaultClientId || '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'planning' as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProject } = useProjects();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Project location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createProject(formData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        client_id: defaultClientId || '',
        priority: 'medium',
        status: 'planning'
      });
      setErrors({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning Phase' },
    { value: 'active', label: 'Active Construction' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Project"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Project Name"
            required
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter project name"
            error={errors.name}
          />
          
          <TextField
            label="Location"
            required
            value={formData.location}
            onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            placeholder="Project location"
            error={errors.location}
          />
        </div>

        <TextAreaField
          label="Description"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Project description (optional)"
          hint="Provide details about the construction project"
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Priority"
            value={formData.priority}
            onChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
            options={priorityOptions}
            placeholder="Select priority level"
          />
          
          <SelectField
            label="Initial Status"
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            options={statusOptions}
            placeholder="Select initial status"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
