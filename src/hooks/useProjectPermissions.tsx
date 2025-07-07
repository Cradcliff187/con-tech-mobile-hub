
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMemo, useEffect } from 'react';

export const useProjectPermissions = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  
  // Development mode: Simplified loading - only wait for auth, not profile
  const loading = authLoading;
  
  // Debug logging for permission issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Permission Debug (Simplified):', {
        user: user?.email,
        hasCompanyEmail: user?.email?.includes('@austinkunzconstruction.com'),
        profile: profile?.role,
        authLoading,
        permissionsLoading: loading
      });
    }
  }, [user?.email, profile?.role, authLoading, loading]);
  
  // Simplified: Company email users get full access to all projects
  const userProjects = useMemo(() => {
    if (!user) return [];
    
    // Development mode: Grant full access to company email users immediately
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    if (hasCompanyEmail) {
      return projects.map(p => p.id);
    }
    
    // For non-company users, only return projects they manage
    return projects
      .filter(p => p.project_manager_id === user.id)
      .map(p => p.id);
  }, [user?.id, user?.email, projects]);

  const canAccessProject = useMemo(() => (projectId: string): boolean => {
    if (!projectId || !user) return false;
    
    // Development mode: Company email users get immediate access
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    if (hasCompanyEmail) {
      return true;
    }
    
    // For others, check if they have project access
    return userProjects.includes(projectId);
  }, [user, userProjects]);

  const canAssignToProject = useMemo(() => (projectId: string): boolean => {
    if (!projectId || !user) return false;
    
    // Development mode: Company email users get immediate assignment permissions
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    if (hasCompanyEmail) {
      return true;
    }
    
    // For others, they need project access and appropriate role
    const hasBasicAccess = canAccessProject(projectId);
    const hasAssignmentRole = profile?.is_company_user && 
                             profile?.account_status === 'approved' &&
                             ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
    
    return hasBasicAccess && hasAssignmentRole;
  }, [user, profile, canAccessProject]);

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects,
    sessionError: null
  };
};
