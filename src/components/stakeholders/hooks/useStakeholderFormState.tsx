
import { useState, useEffect } from 'react';
import { type StakeholderFormData } from '@/schemas';
import { getInitialFormData } from '../utils/stakeholderFormUtils';
import { coerceFieldValue } from '@/utils/form-type-guards';

interface UseStakeholderFormStateProps {
  defaultType: 'client' | 'subcontractor' | 'employee' | 'vendor';
}

export const useStakeholderFormState = ({ defaultType }: UseStakeholderFormStateProps) => {
  const [formData, setFormData] = useState<StakeholderFormData>(() => getInitialFormData(defaultType));
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setFormData(prev => ({ ...prev, stakeholder_type: defaultType }));
  }, [defaultType]);

  const handleInputChange = (field: string, value: any) => {
    // Use the same coercion logic as the main form hook
    const coercedValue = coerceFieldValue(field, value);
    
    setFormData(prev => ({ ...prev, [field]: coercedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData(defaultType));
    setErrors({});
  };

  return {
    formData,
    errors,
    setErrors,
    handleInputChange,
    resetForm
  };
};
