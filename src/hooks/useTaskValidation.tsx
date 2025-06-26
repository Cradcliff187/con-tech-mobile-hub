
import { useState, useCallback } from 'react';
import { taskSchema, editTaskSchema, type TaskFormData, type EditTaskFormData, validateFormData } from '@/schemas';
import { sanitizeInput, sanitizeStringArray } from '@/utils/validation';
import { Task } from '@/types/database';
import { useProjects } from '@/hooks/useProjects';

interface ValidationResult<T = TaskFormData> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

interface UseTaskValidationProps {
  projectId?: string;
  taskType?: 'regular' | 'punch_list';
  isEditMode?: boolean;
}

export const useTaskValidation = ({ 
  projectId, 
  taskType = 'regular', 
  isEditMode = false 
}: UseTaskValidationProps = {}) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { projects } = useProjects();

  const validateTaskData = useCallback((formData: Partial<TaskFormData | EditTaskFormData>): ValidationResult<TaskFormData | EditTaskFormData> => {
    // Clear previous errors
    setErrors({});

    // Get project for lifecycle validation
    const project = projects.find(p => p.id === (formData.project_id || projectId));

    // Sanitize text fields before validation
    const sanitizedFormData = {
      ...formData,
      title: sanitizeInput(formData.title || '', 'text') as string,
      description: sanitizeInput(formData.description || '', 'html') as string,
      category: sanitizeInput(formData.category || '', 'text') as string,
      required_skills: sanitizeStringArray(formData.required_skills || []),
      // Ensure date fields are undefined if empty, not empty strings
      due_date: formData.due_date === '' ? undefined : formData.due_date,
      start_date: formData.start_date === '' ? undefined : formData.start_date,
      // Ensure estimated_hours is properly typed
      estimated_hours: typeof formData.estimated_hours === 'string' 
        ? (formData.estimated_hours === '' ? undefined : parseInt(formData.estimated_hours))
        : formData.estimated_hours,
    };

    // Apply conditional validation rules
    const conditionalValidation = validateConditionalRules(sanitizedFormData, project, taskType);
    
    if (!conditionalValidation.success) {
      setErrors(conditionalValidation.errors || {});
      return conditionalValidation;
    }

    // Run appropriate schema validation
    const schema = isEditMode ? editTaskSchema : taskSchema;
    const validation = validateFormData(schema, sanitizedFormData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return validation;
    }
    
    return { success: true, data: validation.data };
  }, [projects, projectId, taskType, isEditMode]);

  const validateConditionalRules = useCallback((
    formData: Partial<TaskFormData | EditTaskFormData>, 
    project: any, 
    taskType: string
  ): ValidationResult => {
    const conditionalErrors: Record<string, string[]> = {};

    // Task Type Specific Validation
    if (taskType === 'punch_list' || formData.task_type === 'punch_list') {
      if (!formData.punch_list_category) {
        conditionalErrors.punch_list_category = ['Punch list category is required for punch list tasks'];
      }
    }

    // Project Lifecycle Validation
    if (project) {
      const projectStatus = project.unified_lifecycle_status || project.status;
      
      // Restrict task creation/editing based on project status
      if (projectStatus === 'project_cancelled') {
        conditionalErrors.project_id = ['Cannot create or edit tasks for cancelled projects'];
      }
      
      if (projectStatus === 'project_completed' && !isEditMode) {
        conditionalErrors.project_id = ['Cannot create new tasks for completed projects'];
      }

      // Phase-specific validations
      if (projectStatus === 'pre_construction' && formData.task_type === 'punch_list') {
        conditionalErrors.task_type = ['Punch list tasks cannot be created during pre-construction phase'];
      }
    }

    // Status-Progress Consistency Validation
    if (formData.status && formData.progress !== undefined) {
      const status = formData.status;
      const progress = formData.progress;

      if (status === 'not-started' && progress > 0) {
        conditionalErrors.progress = ['Progress must be 0% for not-started tasks'];
      }
      
      if (status === 'completed' && progress < 100) {
        conditionalErrors.progress = ['Progress must be 100% for completed tasks'];
      }
      
      if (status === 'in-progress' && (progress <= 0 || progress >= 100)) {
        conditionalErrors.progress = ['Progress must be between 1% and 99% for in-progress tasks'];
      }
    }

    // Assignment Validation
    if (formData.assigned_stakeholder_id && formData.assigned_stakeholder_ids?.length) {
      conditionalErrors.assigned_stakeholder_ids = ['Cannot use both single and multiple stakeholder assignments'];
    }

    // Date Logic Validation
    if (formData.start_date && formData.due_date) {
      const startDate = new Date(formData.start_date);
      const dueDate = new Date(formData.due_date);
      
      if (startDate > dueDate) {
        conditionalErrors.due_date = ['Due date must be after start date'];
      }
    }

    // Skills Validation
    if (formData.required_skills && formData.required_skills.length > 20) {
      conditionalErrors.required_skills = ['Maximum 20 skills allowed'];
    }

    if (Object.keys(conditionalErrors).length > 0) {
      return { success: false, errors: conditionalErrors };
    }

    return { success: true };
  }, [isEditMode]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  }, [errors]);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    validateTaskData,
    errors,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors
  };
};
