
import { useCallback } from 'react';
import { Task } from '@/types/database';

interface UseTaskFormHandlersProps {
  status: Task['status'];
  progress: number;
  setProgress: (value: number) => void;
  setStatus: (status: Task['status']) => void;
  projectId: string;
  setProjectId: (id: string) => void;
  requiredSkills: string[];
  setRequiredSkills: (skills: string[]) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  clearFieldError: (fieldName: string) => void;
  applyProjectDefaults: (newProjectId: string, oldProjectId: string) => void;
}

export const useTaskFormHandlers = ({
  status,
  progress,
  setProgress,
  setStatus,
  projectId,
  setProjectId,
  requiredSkills,
  setRequiredSkills,
  newSkill,
  setNewSkill,
  clearFieldError,
  applyProjectDefaults,
}: UseTaskFormHandlersProps) => {
  
  // Smart status-progress synchronization
  const syncProgressWithStatus = useCallback((newStatus: Task['status'], currentProgress: number) => {
    switch (newStatus) {
      case 'not-started':
        return 0;
      case 'completed':
        return 100;
      case 'in-progress':
      case 'blocked':
        if (currentProgress === 0) return 10;
        if (currentProgress === 100) return 90;
        return currentProgress;
      default:
        return currentProgress;
    }
  }, []);

  const validateProgressForStatus = useCallback((progress: number, status: Task['status']): number => {
    switch (status) {
      case 'not-started':
        return 0;
      case 'completed':
        return 100;
      default:
        return Math.max(0, Math.min(100, progress));
    }
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    const taskStatus = newStatus as Task['status'];
    setStatus(taskStatus);
    
    const newProgress = syncProgressWithStatus(taskStatus, progress);
    setProgress(newProgress);
    
    // Clear field errors when user makes changes
    clearFieldError('status');
    clearFieldError('progress');
  }, [syncProgressWithStatus, progress, setStatus, setProgress, clearFieldError]);

  const handleProgressChange = useCallback((newProgress: number) => {
    const validatedProgress = validateProgressForStatus(newProgress, status);
    setProgress(validatedProgress);
    
    clearFieldError('progress');
  }, [validateProgressForStatus, status, setProgress, clearFieldError]);

  const handleProjectChange = useCallback((newProjectId: string) => {
    const oldProjectId = projectId;
    setProjectId(newProjectId);
    
    if (newProjectId !== oldProjectId) {
      applyProjectDefaults(newProjectId, oldProjectId);
    }
    
    clearFieldError('project_id');
  }, [projectId, setProjectId, applyProjectDefaults, clearFieldError]);

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim()) && requiredSkills.length < 20) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
      clearFieldError('required_skills');
    }
  }, [newSkill, requiredSkills, setRequiredSkills, setNewSkill, clearFieldError]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
    clearFieldError('required_skills');
  }, [requiredSkills, setRequiredSkills, clearFieldError]);

  return {
    handleStatusChange,
    handleProgressChange: handleProgressChange,
    handleProjectChange,
    handleAddSkill,
    handleRemoveSkill,
  };
};
