
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/database';

interface UseTaskFormStateProps {
  task: Task | null;
  open: boolean;
}

export const useTaskFormState = ({ task, open }: UseTaskFormStateProps) => {
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

  // Assignment fields
  const [assignedStakeholderId, setAssignedStakeholderId] = useState<string | undefined>();
  const [assignedStakeholderIds, setAssignedStakeholderIds] = useState<string[]>([]);

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setProjectId(task.project_id || '');
      
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

      // Assignment fields - Load from junction table first, fallback to legacy
      const junctionAssignments = (task as any).stakeholder_assignments || [];
      const activeAssignments = junctionAssignments
        .filter((assignment: any) => assignment.stakeholder)
        .map((assignment: any) => assignment.stakeholder.id);

      if (activeAssignments.length > 0) {
        // Use junction table assignments (new system)
        setAssignedStakeholderIds(activeAssignments);
        setAssignedStakeholderId(undefined);
      } else {
        // Fallback to legacy single assignment
        setAssignedStakeholderId(task.assigned_stakeholder_id);
        setAssignedStakeholderIds([]);
      }
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
    setAssignedStakeholderId(undefined);
    setAssignedStakeholderIds([]);
  }, []);

  return {
    // Basic fields
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    status,
    setStatus,
    dueDate,
    setDueDate,
    projectId,
    setProjectId,
    
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
    setRequiredSkills,
    punchListCategory,
    setPunchListCategory,
    newSkill,
    setNewSkill,
    
    // Assignment fields
    assignedStakeholderId,
    setAssignedStakeholderId,
    assignedStakeholderIds,
    setAssignedStakeholderIds,
    
    // Utilities
    resetForm,
  };
};
