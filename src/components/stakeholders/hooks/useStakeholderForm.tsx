
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { validateFormData, stakeholderSchema } from '@/schemas';
import { transformStakeholderData, getInitialFormData } from '../utils/stakeholderFormUtils';
import { type StakeholderFormData } from '@/schemas';

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useStakeholderForm = ({ defaultType = 'subcontractor', onSuccess, onClose }: UseStakeholderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  // Direct state management with proper typing
  const [formData, setFormData] = useState<StakeholderFormData>(getInitialFormData(defaultType));
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  // Enhanced handleInputChange with proper type handling
  const handleInputChange = (field: string, value: any) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Special handling for crew_size to ensure proper type conversion
      if (field === 'crew_size') {
        if (value === '' || value === null || value === undefined) {
          newData.crew_size = undefined;
        } else if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          newData.crew_size = isNaN(parsed) ? undefined : parsed;
        } else if (typeof value === 'number') {
          newData.crew_size = value;
        } else {
          newData.crew_size = undefined;
        }
        return newData;
      }
      
      // Validation for stakeholder_type to ensure it's never undefined
      if (field === 'stakeholder_type') {
        if (!value || !['client', 'subcontractor', 'employee', 'vendor'].includes(value)) {
          // Don't update if invalid value
          return prevData;
        }
        newData.stakeholder_type = value;
        return newData;
      }
      
      // Standard field updates with type safety
      (newData as any)[field] = value;
      return newData;
    });
  };

  const resetForm = () => {
    setFormData(getInitialFormData(defaultType));
    setErrors({});
  };

  const validateForm = (): boolean => {
    const validation = validateFormData(stakeholderSchema, formData);
    
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
      const validation = validateFormData(stakeholderSchema, formData);
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
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateForm
  };
};
