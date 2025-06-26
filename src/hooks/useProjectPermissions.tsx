
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';

interface ProjectPermissions {
  canAccessProject: (projectId: string) => boolean;
  canAssignToProject: (projectId: string) => boolean;
  loading: boolean;
  userProjects: string[];
  sessionError: string | null;
}

export const useProjectPermissions = (): ProjectPermissions => {
  const { user, profile } = useAuth();
  const { validateSessionForOperation, sessionHealth } = useAuthSession();
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Validate session before making permission-critical calls
        const sessionValid = await validateSessionForOperation('Project Access Check');
        if (!sessionValid) {
          setSessionError('Session validation failed');
          setLoading(false);
          return;
        }

        setSessionError(null);
        const accessibleProjectIds = await getUserAccessibleProjects();
        
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id')
          .or(`project_manager_id.eq.${user.id}${accessibleProjectIds ? `,id.in.(${accessibleProjectIds})` : ''}`);

        if (error) {
          console.error('Error fetching user projects:', error);
          setUserProjects([]);
          setSessionError(`Database error: ${error.message}`);
        } else {
          setUserProjects(projects?.map(p => p.id) || []);
        }
      } catch (error) {
        console.error('Error in fetchUserProjects:', error);
        setUserProjects([]);
        setSessionError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [user, sessionHealth.isHealthy]);

  const getUserAccessibleProjects = async (): Promise<string> => {
    if (!user) return '';
    
    try {
      // Check if user is company user with broader access
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_company_user, account_status')
        .eq('id', user.id)
        .single();

      if (profile?.is_company_user === true && profile?.account_status === 'approved') {
        // Company users can access all projects
        const { data: allProjects } = await supabase
          .from('projects')
          .select('id');
        
        return allProjects?.map(p => p.id).join(',') || '';
      }

      return '';
    } catch (error) {
      console.error('Error checking user access:', error);
      return '';
    }
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!projectId || sessionError) return false;
    return userProjects.includes(projectId);
  };

  const canAssignToProject = (projectId: string): boolean => {
    if (!projectId || sessionError) return false;
    // Enhanced permission check for task assignment
    const hasBasicAccess = canAccessProject(projectId);
    const hasRequiredRole = profile?.is_company_user && profile?.account_status === 'approved';
    return hasBasicAccess && hasRequiredRole;
  };

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects,
    sessionError
  };
};
