
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { taskSchema, type TaskFormData, validateFormData } from '@/schemas';
import { sanitizeInput, sanitizeStringArray } from '@/utils/validation';
import { getTaskDefaults } from '@/utils/smart-defaults';

interface UseCreateTaskFormProps {
  onSuccess: () => void;
}

export const useCreateTaskForm = ({ onSuccess }: UseCreateTaskFormProps) => {
  const [formData, setFormData] = useState<Partial<TaskFormData>>({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    status: 'not-started',
    category: '',
    due_date: '',
    start_date: '',
    estimated_hours: undefined,
    required_skills: [],
    punch_list_category: undefined,
    assigned_stakeholder_id: undefined,
    assigned_stakeholder_ids: [],
    task_type: 'regular',
    progress: 0
  });

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const selectedProject = projects.find(p => p.id === formData.project_id);

  // Apply smart defaults when project changes
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

  const handleInputChange = (field: keyof TaskFormData, value: string | number | string[] | undefined) => {
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
        processedValue = sanitizeStringArray(value as string[]);
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
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddSkill = () => {
    const sanitizedSkill = sanitizeInput(newSkill, 'text') as string;
    if (sanitizedSkill && !formData.required_skills?.includes(sanitizedSkill)) {
      const updatedSkills = [...(formData.required_skills || []), sanitizedSkill];
      handleInputChange('required_skills', updatedSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.required_skills?.filter(skill => skill !== skillToRemove) || [];
    handleInputChange('required_skills', updatedSkills);
  };

  const validateForm = (): boolean => {
    // Sanitize text fields and handle dates before validation
    const sanitizedFormData = {
      ...formData,
      title: sanitizeInput(formData.title || '', 'text') as string,
      description: sanitizeInput(formData.description || '', 'html') as string,
      category: sanitizeInput(formData.category || '', 'text') as string,
      // Ensure date fields are undefined if empty, not empty strings
      due_date: formData.due_date === '' ? undefined : formData.due_date,
      start_date: formData.start_date === '' ? undefined : formData.start_date,
    };

    const validation = validateFormData(taskSchema, sanitizedFormData);
    
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
      // Sanitize all text fields and handle dates before submission
      const sanitizedFormData = {
        ...formData,
        title: sanitizeInput(formData.title || '', 'text') as string,
        description: sanitizeInput(formData.description || '', 'html') as string,
        category: sanitizeInput(formData.category || '', 'text') as string,
        // Ensure date fields are undefined if empty, not empty strings
        due_date: formData.due_date === '' ? undefined : formData.due_date,
        start_date: formData.start_date === '' ? undefined : formData.start_date,
      };

      const validation = validateFormData(taskSchema, sanitizedFormData);
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
          const assignedStakeholders = assignedStakeholderIds
            .map(id => stakeholders.find(s => s.id === id))
            .filter(Boolean);
          
          if (assignedStakeholders.length === 1) {
            const stakeholder = assignedStakeholders[0];
            successMessage = `${validation.data.title} has been created and assigned to ${stakeholder!.company_name || stakeholder!.contact_person}`;
          } else if (assignedStakeholders.length > 1) {
            successMessage = `${validation.data.title} has been created and assigned to ${assignedStakeholders.length} stakeholders`;
          }
        }
        
        toast({
          title: "Task created successfully",
          description: successMessage
        });
        
        resetForm();
        onSuccess();
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      priority: 'medium',
      status: 'not-started',
      category: '',
      due_date: '',
      start_date: '',
      estimated_hours: undefined,
      required_skills: [],
      punch_list_category: undefined,
      assigned_stakeholder_id: undefined,
      assigned_stakeholder_ids: [],
      task_type: 'regular',
      progress: 0
    });
    setNewSkill('');
    setErrors({});
    setMultiSelectMode(false);
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  return {
    formData,
    newSkill,
    setNewSkill,
    errors,
    loading,
    projects,
    selectedProject,
    workers,
    multiSelectMode,
    setMultiSelectMode,
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSubmit,
    getFieldError
  };
};
