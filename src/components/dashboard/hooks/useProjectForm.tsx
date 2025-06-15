
import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  budget: string;
  clientId: string;
  status: 'planning' | 'active';
  startDate: string;
  endDate: string;
}

interface UseProjectFormProps {
  onClose: () => void;
  defaultValues?: Partial<Omit<ProjectFormData, 'status'>>;
}

export const useProjectForm = ({ onClose, defaultValues = {} }: UseProjectFormProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    location: '',
    budget: '',
    clientId: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    ...defaultValues,
  });
  const [loading, setLoading] = useState(false);
  
  const { createProject } = useProjects();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      budget: '',
      clientId: '',
      status: 'planning',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast({
        title: "Client Required",
        description: "Please select a client or create a new one",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    const projectData = {
      name: formData.name,
      description: formData.description || undefined,
      location: formData.location || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      client_id: formData.clientId,
      status: formData.status,
      start_date: formData.startDate || undefined,
      end_date: formData.endDate || undefined,
      progress: 0
    };

    const { error } = await createProject(projectData);

    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
      toast({
        title: "Error creating project",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Project created successfully",
        description: `${formData.name} has been created and is ready for team assignment`
      });
      
      resetForm();
      onClose();
    }
    
    setLoading(false);
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  };
};
