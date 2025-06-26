
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/database';
import { useProjectReassignmentDefaults } from '@/hooks/useProjectReassignmentDefaults';
import { useProjects } from '@/hooks/useProjects';

interface UseEditTaskFormProps {
  task: Task | null;
  open: boolean;
}

export const useEditTaskForm = ({ task, open }: UseEditTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('not-started');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [projectId, setProjectId] = useState('');
  
  // Advanced fields
  const [taskType, setTaskType] = useState<'regular' | 'punch_list'>('regular');
  const [category, setCategory] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [actualHours, setActualHours] = useState<number | undefined>();
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [punchListCategory, setPunchListCategory] = useState<'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | ''>('');
  const [newSkill, setNewSkill] = useState('');

  const { projects } = useProjects();

  const handleApplyDefaults = useCallback((defaults: any) => {
    setCategory(defaults.category);
    setRequiredSkills(defaults.requiredSkills);
    if (defaults.estimatedHours !== undefined) {
      setEstimatedHours(defaults.estimatedHours);
    }
  }, []);

  const { applyProjectDefaults } = useProjectReassignmentDefaults({
    projects,
    onApplyDefaults: handleApplyDefaults
  });

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setProjectId(task.project_id);
      
      // Advanced fields
      setTaskType(task.task_type || 'regular');
      setCategory(task.category || '');
      setEstimatedHours(task.estimated_hours || undefined);
      setActualHours(task.actual_hours || undefined);
      setProgress(task.progress || 0);
      setStartDate(task.start_date ? new Date(task.start_date) : undefined);
      setRequiredSkills(task.required_skills || []);
      setPunchListCategory(task.punch_list_category || '');
      setNewSkill('');
    }
  }, [task, open]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('not-started');
    setDueDate(undefined);
    setProjectId('');
    setTaskType('regular');
    setCategory('');
    setEstimatedHours(undefined);
    setActualHours(undefined);
    setProgress(0);
    setStartDate(undefined);
    setRequiredSkills([]);
    setPunchListCategory('');
    setNewSkill('');
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as Task['status']);
  };

  const handleProjectChange = (newProjectId: string) => {
    const oldProjectId = projectId;
    setProjectId(newProjectId);
    
    // Apply smart defaults when project changes
    if (newProjectId !== oldProjectId) {
      applyProjectDefaults(newProjectId, oldProjectId);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim()) && requiredSkills.length < 20) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const getFormData = () => ({
    title: title.trim(),
    description: description.trim() || undefined,
    priority,
    status,
    due_date: dueDate?.toISOString(),
    project_id: projectId,
    task_type: taskType,
    category: category.trim() || undefined,
    estimated_hours: estimatedHours,
    actual_hours: actualHours,
    progress,
    start_date: startDate?.toISOString(),
    required_skills: requiredSkills.length > 0 ? requiredSkills : undefined,
    punch_list_category: taskType === 'punch_list' && punchListCategory ? punchListCategory as Task['punch_list_category'] : undefined,
  });

  return {
    // Basic fields
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    status,
    handleStatusChange,
    dueDate,
    setDueDate,
    projectId,
    handleProjectChange,
    
    // Advanced fields
    taskType,
    setTaskType,
    category,
    setCategory,
    estimatedHours,
    setEstimatedHours,
    actualHours,
    setActualHours,
    progress,
    setProgress,
    startDate,
    setStartDate,
    requiredSkills,
    newSkill,
    setNewSkill,
    handleAddSkill,
    handleRemoveSkill,
    punchListCategory,
    setPunchListCategory,
    
    // Utilities
    resetForm,
    getFormData,
  };
};
