
import { useEffect, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { getTaskDefaults } from '@/utils/smart-defaults';
import { useCreateTaskFormState } from './useCreateTaskFormState';
import { useCreateTaskFormValidation } from './useCreateTaskFormValidation';
import { useCreateTaskFormHandlers } from './useCreateTaskFormHandlers';

interface UseCreateTaskFormProps {
  onSuccess: () => void;
  defaultProjectId?: string;
  defaultCategory?: string;
}

export const useCreateTaskForm = ({ 
  onSuccess, 
  defaultProjectId, 
  defaultCategory 
}: UseCreateTaskFormProps) => {
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();
  const { createTask } = useTasks();

  // State management
  const {
    formData,
    setFormData,
    newSkill,
    setNewSkill,
    loading,
    setLoading,
    multiSelectMode,
    setMultiSelectMode,
    resetForm: resetFormState,
  } = useCreateTaskFormState();

  // Validation
  const {
    validateForm,
    validateTaskData,
    errors,
    clearAllErrors,
    getFieldError,
    hasErrors,
  } = useCreateTaskFormValidation({ formData });

  // Handlers - Memoize to prevent recreation on every render
  const { handleInputChange, handleAddSkill, handleRemoveSkill } = useCreateTaskFormHandlers({
    formData,
    setFormData,
    newSkill,
    setNewSkill,
    clearFieldError: (fieldName: string) => {
      // This will be handled by the validation hook
    },
  });

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === formData.project_id), 
    [projects, formData.project_id]
  );

  // Set default values when component mounts or defaults change
  useEffect(() => {
    if (defaultProjectId && !formData.project_id) {
      handleInputChange('project_id', defaultProjectId);
    }
    if (defaultCategory && !formData.category) {
      handleInputChange('category', defaultCategory);
    }
  }, [defaultProjectId, defaultCategory, formData.project_id, formData.category, handleInputChange]);

  // Apply smart defaults when project changes - Fix: Remove setFormData from dependencies
  useEffect(() => {
    if (selectedProject) {
      const defaults = getTaskDefaults(selectedProject);
      setFormData(prev => ({ ...prev, ...defaults }));
    }
  }, [selectedProject]);

  // Filter stakeholders to get workers with skills - include all assignable types
  const workers = stakeholders.filter(s => 
    ['employee', 'subcontractor', 'vendor'].includes(s.stakeholder_type) && 
    s.status === 'active'
  );

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
      const validation = validateTaskData(formData);
      if (!validation.success || !validation.data) {
        throw new Error('Form validation failed');
      }

      // Ensure estimated_hours is a number or undefined
      const taskData = {
        ...validation.data,
        estimated_hours: typeof validation.data.estimated_hours === 'string' 
          ? parseInt(validation.data.estimated_hours) || undefined 
          : validation.data.estimated_hours
      };

      const { error } = await createTask(taskData);

      if (error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
        toast({
          title: "Error creating task",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        // Generate success message based on assignments
        let successMessage = `${validation.data.title} has been created successfully`;
        
        const assignedStakeholderIds = validation.data.assigned_stakeholder_ids || 
          (validation.data.assigned_stakeholder_id ? [validation.data.assigned_stakeholder_id] : []);
        
        if (assignedStakeholderIds.length > 0) {
          const assignedCount = assignedStakeholderIds.length;
          successMessage += ` and assigned to ${assignedCount} stakeholder${assignedCount > 1 ? 's' : ''}`;
        }
        
        toast({
          title: "Task created successfully",
          description: successMessage
        });
        
        onSuccess();
        resetFormState();
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error creating task",
        description: error?.message || 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    resetFormState();
    clearAllErrors();
    // Reapply defaults after reset
    if (defaultProjectId) {
      handleInputChange('project_id', defaultProjectId);
    }
    if (defaultCategory) {
      handleInputChange('category', defaultCategory);
    }
  };

  return {
    formData,
    setFormData,
    newSkill,
    setNewSkill,
    loading,
    errors,
    projects,
    selectedProject,
    workers,
    multiSelectMode,
    setMultiSelectMode,
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSubmit,
    resetForm,
    validateForm,
    validateTaskData,
    clearAllErrors,
    getFieldError,
    hasErrors,
  };
};
