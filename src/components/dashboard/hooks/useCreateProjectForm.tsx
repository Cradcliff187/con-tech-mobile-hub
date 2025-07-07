
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { projectSchema, type ProjectFormData, validateFormData } from '@/schemas';
import { sanitizeOnSubmit, sanitizeEmailOnSubmit, sanitizePhoneOnSubmit } from '@/utils/iosFriendlyValidation';

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
    // Store raw input value without sanitization to allow natural typing
    // Sanitization will be applied only during form submission
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  const handleSubmit = async () => {
    // Sanitize form data before validation and submission
    const sanitizedFormData = {
      ...formData,
      name: sanitizeOnSubmit(formData.name || '') || '',
      description: sanitizeOnSubmit(formData.description || ''),
      street_address: sanitizeOnSubmit(formData.street_address || ''),
      city: sanitizeOnSubmit(formData.city || ''),
      state: sanitizeOnSubmit(formData.state || ''),
      zip_code: sanitizeOnSubmit(formData.zip_code || ''),
    };

    const validation = validateFormData(projectSchema, sanitizedFormData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({
        ...validation.data,
        budget: typeof validation.data.budget === 'string' ? parseFloat(validation.data.budget) : validation.data.budget,
        progress: 0
      });

      toast({
        title: "Success",
        description: "Project created successfully",
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
