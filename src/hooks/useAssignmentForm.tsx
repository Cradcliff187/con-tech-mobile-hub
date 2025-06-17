
import { useState, useEffect } from 'react';
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
    notes: ''
  });

  const selectedProject = projects.find(p => p.id === formData.project_id);

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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && stakeholder) {
      const currentDate = new Date().toISOString().split('T')[0];
      setFormData({
        project_id: '',
        task_id: 'none',
        role: '',
        start_date: currentDate,
        end_date: '',
        hourly_rate: '',
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
      notes: ''
    });
  };

  return {
    formData,
    setFormData,
    selectedProject,
    projects,
    resetForm
  };
};
