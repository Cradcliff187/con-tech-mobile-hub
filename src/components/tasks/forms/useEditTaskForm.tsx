
import { useCallback } from 'react';
import { Task } from '@/types/database';
import { useProjectReassignmentDefaults } from '@/hooks/useProjectReassignmentDefaults';
import { useProjects } from '@/hooks/useProjects';
import { useTaskFormState } from './hooks/useTaskFormState';
import { useTaskFormHandlers } from './hooks/useTaskFormHandlers';
import { useTaskFormValidation } from './hooks/useTaskFormValidation';

interface UseEditTaskFormProps {
  task: Task | null;
  open: boolean;
}

export const useEditTaskForm = ({ task, open }: UseEditTaskFormProps) => {
  const { projects } = useProjects();
  
  // State management
  const formState = useTaskFormState({ task, open });
  
  // Validation
  const validation = useTaskFormValidation({ 
    projectId: formState.projectId, 
    taskType: formState.taskType, 
    task 
  });

  const handleApplyDefaults = useCallback((defaults: any) => {
    formState.setCategory(defaults.category);
    formState.setRequiredSkills(defaults.requiredSkills);
    if (defaults.estimatedHours !== undefined) {
      formState.setEstimatedHours(defaults.estimatedHours);
    }
  }, [formState]);

  const { applyProjectDefaults } = useProjectReassignmentDefaults({
    projects,
    onApplyDefaults: handleApplyDefaults
  });

  // Handlers
  const handlers = useTaskFormHandlers({
    status: formState.status,
    progress: formState.progress,
    setProgress: formState.setProgress,
    setStatus: formState.setStatus,
    projectId: formState.projectId,
    setProjectId: formState.setProjectId,
    requiredSkills: formState.requiredSkills,
    setRequiredSkills: formState.setRequiredSkills,
    newSkill: formState.newSkill,
    setNewSkill: formState.setNewSkill,
    clearFieldError: validation.clearFieldError,
    applyProjectDefaults,
  });

  // Enhanced reset form that also clears validation errors
  const resetForm = useCallback(() => {
    formState.resetForm();
    validation.clearAllErrors();
  }, [formState, validation]);

  // Field change handlers with validation clearing
  const handleTitleChange = useCallback((value: string) => {
    formState.setTitle(value);
    validation.clearFieldError('title');
  }, [formState, validation]);

  const handleDescriptionChange = useCallback((value: string) => {
    formState.setDescription(value);
    validation.clearFieldError('description');
  }, [formState, validation]);

  const handleCategoryChange = useCallback((value: string) => {
    formState.setCategory(value);
    validation.clearFieldError('category');
  }, [formState, validation]);

  const handleTaskTypeChange = useCallback((value: 'regular' | 'punch_list') => {
    formState.setTaskType(value);
    validation.clearFieldError('task_type');
    validation.clearFieldError('punch_list_category');
  }, [formState, validation]);

  const handlePunchListCategoryChange = useCallback((value: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '') => {
    formState.setPunchListCategory(value);
    validation.clearFieldError('punch_list_category');
  }, [formState, validation]);

  // Enhanced input change handler with better error handling
  const handleInputChange = useCallback((field: string, value: any) => {
    try {
      switch (field) {
        case 'assigned_stakeholder_id':
          formState.setAssignedStakeholderId(value);
          break;
        case 'assigned_stakeholder_ids':
          formState.setAssignedStakeholderIds(value);
          break;
        default:
          console.warn(`Unhandled field in handleInputChange: ${field}`);
      }
      validation.clearFieldError(field);
    } catch (error) {
      console.error(`Error updating field ${field}:`, error);
    }
  }, [formState, validation]);

  // Validation methods
  const validateForm = useCallback(() => {
    return validation.validateForm({
      title: formState.title,
      description: formState.description,
      priority: formState.priority,
      status: formState.status,
      dueDate: formState.dueDate,
      projectId: formState.projectId,
      taskType: formState.taskType,
      category: formState.category,
      estimatedHours: formState.estimatedHours,
      actualHours: formState.actualHours,
      progress: formState.progress,
      startDate: formState.startDate,
      requiredSkills: formState.requiredSkills,
      punchListCategory: formState.punchListCategory,
    });
  }, [validation, formState]);

  const getFormData = useCallback(() => {
    return validation.getFormData({
      title: formState.title,
      description: formState.description,
      priority: formState.priority,
      status: formState.status,
      dueDate: formState.dueDate,
      projectId: formState.projectId,
      taskType: formState.taskType,
      category: formState.category,
      estimatedHours: formState.estimatedHours,
      actualHours: formState.actualHours,
      progress: formState.progress,
      startDate: formState.startDate,
      requiredSkills: formState.requiredSkills,
      punchListCategory: formState.punchListCategory,
    });
  }, [validation, formState]);

  return {
    // Basic fields
    title: formState.title,
    setTitle: handleTitleChange,
    description: formState.description,
    setDescription: handleDescriptionChange,
    priority: formState.priority,
    setPriority: formState.setPriority,
    status: formState.status,
    handleStatusChange: handlers.handleStatusChange,
    dueDate: formState.dueDate,
    setDueDate: formState.setDueDate,
    projectId: formState.projectId,
    handleProjectChange: handlers.handleProjectChange,
    
    // Progress field
    progress: formState.progress,
    setProgress: handlers.handleProgressChange,
    
    // Advanced fields
    taskType: formState.taskType,
    setTaskType: handleTaskTypeChange,
    category: formState.category,
    setCategory: handleCategoryChange,
    estimatedHours: formState.estimatedHours,
    setEstimatedHours: formState.setEstimatedHours,
    actualHours: formState.actualHours,
    setActualHours: formState.setActualHours,
    startDate: formState.startDate,
    setStartDate: formState.setStartDate,
    requiredSkills: formState.requiredSkills,
    newSkill: formState.newSkill,
    setNewSkill: formState.setNewSkill,
    handleAddSkill: handlers.handleAddSkill,
    handleRemoveSkill: handlers.handleRemoveSkill,
    punchListCategory: formState.punchListCategory,
    setPunchListCategory: handlePunchListCategoryChange,
    
  // Assignment fields (from form state) - Fixed to use form state
  assigned_stakeholder_id: formState.assignedStakeholderId,
  assigned_stakeholder_ids: formState.assignedStakeholderIds,
  
  // Generic handler
  handleInputChange,
    
    // Validation
    validateForm,
    errors: validation.errors,
    getFieldError: validation.getFieldError,
    hasErrors: validation.hasErrors,
    clearFieldError: validation.clearFieldError,
    
    // Utilities
    resetForm,
    getFormData,
  };
};
