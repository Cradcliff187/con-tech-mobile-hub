
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { validateFormData, stakeholderSchema } from '@/schemas';
import { transformStakeholderData } from '../utils/stakeholderFormUtils';
import { useStakeholderFormState } from './useStakeholderFormState';
import { type StakeholderFormData } from '@/schemas';

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useStakeholderForm = ({ defaultType = 'subcontractor', onSuccess, onClose }: UseStakeholderFormProps) => {
  const [loading, setLoading] = useState(false);
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  const {
    formData,
    errors,
    setErrors,
    handleInputChange,
    resetForm
  } = useStakeholderFormState({ defaultType });

  // Type-safe form data
  const typedFormData = formData as StakeholderFormData;

  const validateForm = (): boolean => {
    const validation = validateFormData(stakeholderSchema, typedFormData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const validation = validateFormData(stakeholderSchema, typedFormData);
      if (!validation.success || !validation.data) {
        throw new Error('Form validation failed');
      }

      // Ensure crew_size is properly typed as number | undefined
      const validatedData = {
        ...validation.data,
        crew_size: typeof validation.data.crew_size === 'number' ? validation.data.crew_size : undefined
      };

      const stakeholderData = transformStakeholderData(validatedData);

      const { error } = await createStakeholder(stakeholderData);

      if (error) {
        toast({
          title: "Error creating stakeholder",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Stakeholder created successfully",
          description: `${validatedData.company_name || validatedData.contact_person} has been added with enhanced security validation`
        });
        
        resetForm();
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Stakeholder creation error:', error);
      toast({
        title: "Error creating stakeholder",
        description: "Failed to create stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return {
    formData: typedFormData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateForm
  };
};
