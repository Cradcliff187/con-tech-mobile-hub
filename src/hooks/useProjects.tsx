
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  progress: number;
  location?: string;
  project_manager_id?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    company_name?: string;
    contact_person?: string;
    stakeholder_type: string;
  };
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const createProject = async (projectData: Partial<Project>) => {
    if (!user) return { error: 'User not authenticated' };

    if (!projectData.name) {
      return { error: 'Project name is required' };
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'planning',
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        location: projectData.location,
        progress: projectData.progress || 0,
        project_manager_id: user.id,
        client_id: projectData.client_id
      })
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .single();

    if (!error && data) {
      setProjects(prev => [data, ...prev]);
    }

    return { data, error };
  };

  return {
    projects,
    loading,
    createProject,
    refetch: fetchProjects
  };
};
