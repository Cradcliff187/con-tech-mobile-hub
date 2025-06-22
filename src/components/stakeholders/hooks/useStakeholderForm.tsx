
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { validateFormData, stakeholderSchema } from '@/schemas';
import { transformStakeholderData, getInitialFormData } from '../utils/stakeholderFormUtils';
import { type StakeholderFormData } from '@/schemas';
import { coerceFieldValue } from '@/utils/form-type-guards';

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useStakeholderForm = ({ defaultType = 'subcontractor', onSuccess, onClose }: UseStakeholderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<StakeholderFormData>(getInitialFormData(defaultType));
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  // Simplified handleInputChange using coerceFieldValue utility
  const handleInputChange = (field: string, value: any) => {
    setFormData(prevData => {
      const coercedValue = coerceFieldValue(field, value);
      return { ...prevData, [field]: coercedValue };
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

      // Use the validated data directly - Zod preprocessing handles all transformations
      const stakeholderData = transformStakeholderData(validation.data);

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
          description: `${validation.data.company_name || validation.data.contact_person} has been added successfully`
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
