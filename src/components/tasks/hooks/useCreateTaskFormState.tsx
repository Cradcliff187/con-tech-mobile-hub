
import { useState } from 'react';
import { TaskFormData } from '@/schemas';

export const useCreateTaskFormState = () => {
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
  const [loading, setLoading] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

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
    setMultiSelectMode(false);
  };

  return {
    formData,
    setFormData,
    newSkill,
    setNewSkill,
    loading,
    setLoading,
    multiSelectMode,
    setMultiSelectMode,
    resetForm,
  };
};
