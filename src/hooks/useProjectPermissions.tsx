
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProjectPermissions {
  canAccessProject: (projectId: string) => boolean;
  canAssignToProject: (projectId: string) => boolean;
  loading: boolean;
  userProjects: string[];
}

export const useProjectPermissions = (): ProjectPermissions => {
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id')
          .or(`project_manager_id.eq.${user.id},id.in.(${await getUserAccessibleProjects()})`);

        if (error) {
          console.error('Error fetching user projects:', error);
          setUserProjects([]);
        } else {
          setUserProjects(projects?.map(p => p.id) || []);
        }
      } catch (error) {
        console.error('Error in fetchUserProjects:', error);
        setUserProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [user]);

  const getUserAccessibleProjects = async (): Promise<string> => {
    if (!user) return '';
    
    // Check if user is company user with broader access
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_company_user, account_status')
      .eq('id', user.id)
      .single();

    if (profile?.is_company_user && profile?.account_status === 'approved') {
      // Company users can access all projects
      const { data: allProjects } = await supabase
        .from('projects')
        .select('id');
      
      return allProjects?.map(p => p.id).join(',') || '';
    }

    return '';
  };

  const canAccessProject = (projectId: string): boolean => {
    return userProjects.includes(projectId);
  };

  const canAssignToProject = (projectId: string): boolean => {
    // For now, same as access permission - can be extended later
    return canAccessProject(projectId);
  };

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects
  };
};
