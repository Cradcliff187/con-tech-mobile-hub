
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { projectSchema, type ProjectFormData, validateFormData } from '@/schemas';
import { sanitizeInput } from '@/utils/validation';

interface UseCreateProjectFormProps {
  defaultClientId?: string;
  onSuccess: () => void;
}

export const useCreateProjectForm = ({ defaultClientId, onSuccess }: UseCreateProjectFormProps) => {
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
    unified_lifecycle_status: 'pre_construction',
    start_date: '',
    end_date: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProject } = useProjects();
  const { toast } = useToast();

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
      onSuccess();
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
      unified_lifecycle_status: 'pre_construction',
      start_date: '',
      end_date: ''
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
