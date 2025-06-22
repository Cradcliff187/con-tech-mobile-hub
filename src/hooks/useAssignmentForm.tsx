
import { useState, useEffect, useMemo } from 'react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { useProjects } from '@/hooks/useProjects';
import { getAssignmentDefaults } from '@/utils/smart-defaults';

interface AssignmentFormData {
  project_id: string;
  task_id: string;
  role: string;
  start_date: string;
  end_date: string;
  hourly_rate: string;
  total_hours: string;
  notes: string;
}

export const useAssignmentForm = (stakeholder: Stakeholder | null, open: boolean) => {
  const { projects } = useProjects();
  
  const [formData, setFormData] = useState<AssignmentFormData>({
    project_id: '',
    task_id: 'none',
    role: '',
    start_date: '',
    end_date: '',
    hourly_rate: '',
    total_hours: '',
    notes: ''
  });

  const selectedProject = projects.find(p => p.id === formData.project_id);

  // Calculate estimated cost based on hours and rate
  const estimatedCost = useMemo(() => {
    const hours = parseFloat(formData.total_hours) || 0;
    const rate = parseFloat(formData.hourly_rate) || 0;
    return hours * rate;
  }, [formData.total_hours, formData.hourly_rate]);

  // Calculate estimated hours based on project duration if not manually set
  const estimatedHoursFromDuration = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Estimate 8 hours per working day (assuming 5 day work week)
    const workingDays = Math.floor(diffDays * (5/7));
    return workingDays * 8;
  }, [formData.start_date, formData.end_date]);

  // Validation for employee-specific requirements
  const validation = useMemo(() => {
    const isEmployee = stakeholder?.stakeholder_type === 'employee';
    const errors: string[] = [];

    if (isEmployee) {
      if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
        errors.push('Hourly rate is required for employees');
      }
      if (!formData.total_hours || parseFloat(formData.total_hours) <= 0) {
        errors.push('Total hours is required for employees');
      }
    }

    if (!formData.project_id) {
      errors.push('Project selection is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [stakeholder, formData.project_id, formData.hourly_rate, formData.total_hours]);

  // Apply smart defaults when stakeholder or project changes
  useEffect(() => {
    if (stakeholder && selectedProject) {
      const defaults = getAssignmentDefaults(stakeholder, selectedProject);
      setFormData(prev => ({
        ...prev,
        hourly_rate: defaults.hourly_rate?.toString() || prev.hourly_rate,
        start_date: defaults.start_date || prev.start_date,
        end_date: defaults.end_date || prev.end_date,
        role: defaults.role || prev.role
      }));
    }
  }, [stakeholder, selectedProject]);

  // Auto-populate hours based on duration for employees
  useEffect(() => {
    if (stakeholder?.stakeholder_type === 'employee' && 
        formData.start_date && 
        formData.end_date && 
        !formData.total_hours) {
      setFormData(prev => ({
        ...prev,
        total_hours: estimatedHoursFromDuration.toString()
      }));
    }
  }, [stakeholder, formData.start_date, formData.end_date, formData.total_hours, estimatedHoursFromDuration]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && stakeholder) {
      const currentDate = new Date().toISOString().split('T')[0];
      const isEmployee = stakeholder.stakeholder_type === 'employee';
      
      setFormData({
        project_id: '',
        task_id: 'none',
        role: '',
        start_date: currentDate,
        end_date: '',
        hourly_rate: isEmployee ? '' : '0',
        total_hours: isEmployee ? '' : '0',
        notes: ''
      });
    }
  }, [open, stakeholder]);

  const resetForm = () => {
    setFormData({
      project_id: '',
      task_id: 'none',
      role: '',
      start_date: '',
      end_date: '',
      hourly_rate: '',
      total_hours: '',
      notes: ''
    });
  };

  return {
    formData,
    setFormData,
    selectedProject,
    projects,
    resetForm,
    estimatedCost,
    estimatedHoursFromDuration,
    validation
  };
};
