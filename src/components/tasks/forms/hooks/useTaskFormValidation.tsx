
import { useCallback } from 'react';
import { Task } from '@/types/database';
import { useTaskValidation } from '@/hooks/useTaskValidation';
import { EditTaskFormData } from '@/schemas/task';

interface UseTaskFormValidationProps {
  projectId: string;
  taskType: 'regular' | 'punch_list';
  task?: Task | null;
}

export const useTaskFormValidation = ({ projectId, taskType, task }: UseTaskFormValidationProps) => {
  const { 
    validateTaskData, 
    errors, 
    clearFieldError, 
    clearAllErrors, 
    getFieldError, 
    hasErrors 
  } = useTaskValidation({ 
    projectId, 
    taskType, 
    isEditMode: true 
  });

  // Field change handlers with validation clearing
  const createFieldHandler = useCallback((fieldName: string) => {
    return () => clearFieldError(fieldName);
  }, [clearFieldError]);

  const validateForm = useCallback((formData: {
    title: string;
    description: string;
    priority: Task['priority'];
    status: Task['status'];
    dueDate?: Date;
    projectId: string;
    taskType: 'regular' | 'punch_list';
    category: string;
    estimatedHours?: number;
    actualHours?: number;
    progress: number;
    startDate?: Date;
    requiredSkills: string[];
    punchListCategory: string;
  }): { success: boolean; data?: EditTaskFormData } => {
    const validationData = {
      id: task?.id,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.dueDate?.toISOString().split('T')[0],
      project_id: formData.projectId,
      task_type: formData.taskType,
      category: formData.category.trim() || undefined,
      estimated_hours: formData.estimatedHours,
      actual_hours: formData.actualHours,
      progress: formData.progress,
      start_date: formData.startDate?.toISOString().split('T')[0],
      required_skills: formData.requiredSkills.length > 0 ? formData.requiredSkills : undefined,
      punch_list_category: formData.taskType === 'punch_list' && formData.punchListCategory ? formData.punchListCategory as Task['punch_list_category'] : undefined,
    };

    const validation = validateTaskData(validationData);
    return validation;
  }, [validateTaskData, task?.id]);

  const getFormData = useCallback((formData: {
    title: string;
    description: string;
    priority: Task['priority'];
    status: Task['status'];
    dueDate?: Date;
    projectId: string;
    taskType: 'regular' | 'punch_list';
    category: string;
    estimatedHours?: number;
    actualHours?: number;
    progress: number;
    startDate?: Date;
    requiredSkills: string[];
    punchListCategory: string;
  }) => ({
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    priority: formData.priority,
    status: formData.status,
    due_date: formData.dueDate?.toISOString(),
    project_id: formData.projectId,
    task_type: formData.taskType,
    category: formData.category.trim() || undefined,
    estimated_hours: formData.estimatedHours,
    actual_hours: formData.actualHours,
    progress: formData.progress,
    start_date: formData.startDate?.toISOString(),
    required_skills: formData.requiredSkills.length > 0 ? formData.requiredSkills : undefined,
    punch_list_category: formData.taskType === 'punch_list' && formData.punchListCategory ? formData.punchListCategory as Task['punch_list_category'] : undefined,
  }), []);

  return {
    validateForm,
    getFormData,
    errors,
    getFieldError,
    hasErrors,
    clearFieldError,
    clearAllErrors,
    createFieldHandler,
  };
};
