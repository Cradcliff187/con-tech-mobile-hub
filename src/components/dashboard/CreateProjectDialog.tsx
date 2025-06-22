import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { projectSchema, type ProjectFormData, validateFormData } from '@/schemas';
import { sanitizeInput } from '@/utils/validation';
import { useStakeholders } from '@/hooks/useStakeholders';

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
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    name: '',
    description: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    budget: undefined,
    client_id: defaultClientId || '',
    priority: 'medium',
    status: 'planning',
    start_date: '',
    end_date: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProject } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  // Filter stakeholders to get clients only
  const clients = stakeholders.filter(s => s.stakeholder_type === 'client');

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    // Sanitize input based on field type
    let sanitizedValue: string | number | undefined = value;
    
    switch (field) {
      case 'name':
      case 'city':
      case 'state':
        sanitizedValue = sanitizeInput(value, 'text') as string;
        break;
      case 'description':
        sanitizedValue = sanitizeInput(value, 'html') as string;
        break;
      case 'street_address':
      case 'zip_code':
        sanitizedValue = sanitizeInput(value, 'text') as string;
        break;
      case 'budget':
        // Keep as string for form input, will be converted during validation
        sanitizedValue = value;
        break;
      default:
        sanitizedValue = sanitizeInput(value, 'text') as string;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validation = validateFormData(projectSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const validation = validateFormData(projectSchema, formData);
      if (!validation.success || !validation.data) {
        throw new Error('Form validation failed');
      }

      await createProject({
        ...validation.data,
        budget: typeof validation.data.budget === 'string' ? parseFloat(validation.data.budget) : validation.data.budget,
        progress: 0
      });

      toast({
        title: "Success",
        description: "Project created successfully with enhanced security validation",
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Project creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      budget: undefined,
      client_id: defaultClientId || '',
      priority: 'medium',
      status: 'planning',
      start_date: '',
      end_date: ''
    });
    setErrors({});
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
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.company_name || client.contact_person || 'Unknown Client'
  }));

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
            value={formData.name || ''}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="Enter project name"
            error={errors.name?.[0]}
            hint="Maximum 100 characters"
          />
          
          <SelectField
            label="Client"
            required
            value={formData.client_id || ''}
            onChange={(value) => handleInputChange('client_id', value)}
            options={clientOptions}
            placeholder="Select client"
            error={errors.client_id?.[0]}
          />
        </div>

        <TextAreaField
          label="Description"
          value={formData.description || ''}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Project description (optional)"
          hint="Provide details about the construction project (max 2,000 characters)"
          rows={4}
          error={errors.description?.[0]}
        />

        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Project Location</h4>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Street Address"
              value={formData.street_address || ''}
              onChange={(value) => handleInputChange('street_address', value)}
              placeholder="123 Main Street"
              error={errors.street_address?.[0]}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="City"
                value={formData.city || ''}
                onChange={(value) => handleInputChange('city', value)}
                placeholder="City name"
                error={errors.city?.[0]}
              />
              
              <TextField
                label="State"
                value={formData.state || ''}
                onChange={(value) => handleInputChange('state', value)}
                placeholder="State"
                error={errors.state?.[0]}
              />
              
              <TextField
                label="ZIP Code"
                value={formData.zip_code || ''}
                onChange={(value) => handleInputChange('zip_code', value)}
                placeholder="12345"
                error={errors.zip_code?.[0]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Budget ($)"
            type="text"
            value={typeof formData.budget === 'number' ? formData.budget.toString() : (formData.budget || '')}
            onChange={(value) => handleInputChange('budget', value)}
            placeholder="0"
            hint="Project budget in USD"
            error={errors.budget?.[0]}
          />
          
          <SelectField
            label="Priority"
            value={formData.priority || 'medium'}
            onChange={(value) => handleInputChange('priority', value)}
            options={priorityOptions}
            placeholder="Select priority level"
            error={errors.priority?.[0]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Initial Status"
            value={formData.status || 'planning'}
            onChange={(value) => handleInputChange('status', value)}
            options={statusOptions}
            placeholder="Select initial status"
            error={errors.status?.[0]}
          />
          
          <TextField
            label="Start Date"
            type="text"
            value={formData.start_date || ''}
            onChange={(value) => handleInputChange('start_date', value)}
            placeholder="YYYY-MM-DD"
            hint="Format: YYYY-MM-DD"
            error={errors.start_date?.[0]}
          />
          
          <TextField
            label="Target Completion"
            type="text"
            value={formData.end_date || ''}
            onChange={(value) => handleInputChange('end_date', value)}
            placeholder="YYYY-MM-DD"
            hint="Format: YYYY-MM-DD"
            error={errors.end_date?.[0]}
          />
        </div>

        {clients.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              No clients available. Please create a client first before creating a project.
            </p>
          </div>
        )}

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
            disabled={isSubmitting || clients.length === 0}
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
