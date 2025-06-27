
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMemo } from 'react';

export const useProjectPermissions = () => {
  const { user, profile } = useAuth();
  const { projects } = useProjects();
  
  const userProjects = useMemo(() => {
    if (!user || !profile) return [];
    
    // Admin fallback - always allow access if user is admin
    const isAdmin = profile?.role === 'admin' && 
                   profile?.is_company_user && 
                   profile?.account_status === 'approved';

    if (isAdmin) {
      return projects.map(p => p.id);
    }

    // Non-admin users - check specific assignments
    return projects
      .filter(p => p.project_manager_id === user.id)
      .map(p => p.id);
  }, [user, profile, projects]);

  const canAccessProject = (projectId: string): boolean => {
    if (!projectId || !user || !profile) return false;
    
    const hasProjectAccess = userProjects.includes(projectId);
    const isAdmin = profile?.role === 'admin' && 
                   profile?.is_company_user && 
                   profile?.account_status === 'approved';
    
    return hasProjectAccess || isAdmin;
  };

  const canAssignToProject = (projectId: string): boolean => {
    if (!projectId || !user || !profile) return false;
    
    const hasBasicAccess = canAccessProject(projectId);
    const hasAssignmentRole = profile?.is_company_user && 
                             profile?.account_status === 'approved' &&
                             ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
    
    return hasBasicAccess && hasAssignmentRole;
  };

  return {
    canAccessProject,
    canAssignToProject,
    loading: false,
    userProjects,
    sessionError: null
  };
};
