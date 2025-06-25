
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
    task_type: 'regular',
    progress: 0
  });

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  
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
    // Sanitize input based on field type
    let sanitizedValue: any = value;
    
    switch (field) {
      case 'title':
      case 'category':
        sanitizedValue = sanitizeInput(value as string, 'text');
        break;
      case 'description':
        sanitizedValue = sanitizeInput(value as string, 'html');
        break;
      case 'estimated_hours':
        sanitizedValue = value === '' || value === undefined ? undefined : Number(value);
        break;
      case 'required_skills':
        sanitizedValue = sanitizeStringArray(value as string[]);
        break;
      case 'assigned_stakeholder_id':
        // Ensure empty string becomes undefined for proper database storage
        sanitizedValue = value === '' ? undefined : value;
        break;
      default:
        sanitizedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
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
    const validation = validateFormData(taskSchema, formData);
    
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
      const validation = validateFormData(taskSchema, formData);
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
        // Get assigned stakeholder name for success message
        const assignedStakeholder = formData.assigned_stakeholder_id 
          ? stakeholders.find(s => s.id === formData.assigned_stakeholder_id)
          : null;
        
        const successMessage = assignedStakeholder
          ? `${validation.data.title} has been created and assigned to ${assignedStakeholder.company_name || assignedStakeholder.contact_person}`
          : `${validation.data.title} has been created successfully`;
        
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
      task_type: 'regular',
      progress: 0
    });
    setNewSkill('');
    setErrors({});
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
    handleInputChange,
    handleAddSkill,
    handleRemoveSkill,
    handleSubmit,
    getFieldError
  };
};
