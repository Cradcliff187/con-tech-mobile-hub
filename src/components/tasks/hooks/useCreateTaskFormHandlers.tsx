
import { useCallback } from 'react';
import { TaskFormData } from '@/schemas';
import { sanitizeOnSubmit, sanitizeArrayOnSubmit } from '@/utils/iosFriendlyValidation';

interface UseCreateTaskFormHandlersProps {
  formData: Partial<TaskFormData>;
  setFormData: (data: Partial<TaskFormData> | ((prev: Partial<TaskFormData>) => Partial<TaskFormData>)) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  clearFieldError: (fieldName: string) => void;
}

export const useCreateTaskFormHandlers = ({
  formData,
  setFormData,
  newSkill,
  setNewSkill,
  clearFieldError,
}: UseCreateTaskFormHandlersProps) => {

  const handleInputChange = useCallback((field: keyof TaskFormData, value: string | number | string[] | undefined) => {
    // For text-based fields that users type in, allow raw input without sanitization
    // Only sanitize non-text fields that need immediate processing
    let processedValue: any = value;
    
    switch (field) {
      case 'title':
      case 'description':
      case 'category':
        // Allow raw input for typing fields - no sanitization during typing
        processedValue = value;
        break;
      case 'due_date':
      case 'start_date':
        // Convert empty date strings to undefined for proper database storage
        processedValue = value === '' ? undefined : value;
        break;
      case 'estimated_hours':
        processedValue = value === '' || value === undefined ? undefined : Number(value);
        break;
      case 'required_skills':
        processedValue = sanitizeArrayOnSubmit(value as string[]);
        break;
      case 'assigned_stakeholder_id':
        // Ensure empty string becomes undefined for proper database storage
        processedValue = value === '' ? undefined : value;
        // Clear multi-assignment when single assignment is set
        if (processedValue) {
          setFormData(prev => ({ ...prev, assigned_stakeholder_ids: [] }));
        }
        break;
      case 'assigned_stakeholder_ids':
        processedValue = Array.isArray(value) ? value : [];
        // Clear single assignment when multi-assignment is set
        if (Array.isArray(value) && value.length > 0) {
          setFormData(prev => ({ ...prev, assigned_stakeholder_id: undefined }));
        }
        break;
      default:
        processedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear field error when user starts typing/changing values
    clearFieldError(field);
  }, [setFormData, clearFieldError]);

  const handleAddSkill = useCallback(() => {
    const sanitizedSkill = sanitizeOnSubmit(newSkill);
    if (sanitizedSkill && !formData.required_skills?.includes(sanitizedSkill)) {
      const updatedSkills = [...(formData.required_skills || []), sanitizedSkill];
      handleInputChange('required_skills', updatedSkills);
      setNewSkill('');
    }
  }, [newSkill, formData.required_skills, handleInputChange, setNewSkill]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    const updatedSkills = formData.required_skills?.filter(skill => skill !== skillToRemove) || [];
    handleInputChange('required_skills', updatedSkills);
  }, [formData.required_skills, handleInputChange]);

  return {
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
  };
};
