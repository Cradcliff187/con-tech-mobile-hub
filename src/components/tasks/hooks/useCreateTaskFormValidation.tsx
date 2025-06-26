
import { useCallback } from 'react';
import { useTaskValidation } from '@/hooks/useTaskValidation';
import { TaskFormData } from '@/schemas';

interface UseCreateTaskFormValidationProps {
  formData: Partial<TaskFormData>;
}

export const useCreateTaskFormValidation = ({ formData }: UseCreateTaskFormValidationProps) => {
  const { 
    validateTaskData, 
    errors, 
    clearFieldError, 
    clearAllErrors, 
    getFieldError, 
    hasErrors 
  } = useTaskValidation({ 
    projectId: formData.project_id, 
    taskType: formData.task_type as 'regular' | 'punch_list',
    isEditMode: false 
  });

  const validateForm = useCallback((): boolean => {
    const validation = validateTaskData(formData);
    return validation.success;
  }, [validateTaskData, formData]);

  return {
    validateForm,
    validateTaskData,
    errors,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors,
  };
};
