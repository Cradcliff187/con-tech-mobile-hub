
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMemo, useEffect } from 'react';

export const useProjectPermissions = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  
  // Calculate loading state - we're loading if auth is loading or if we have user but no profile yet
  const loading = authLoading || (!!user && !profile);
  
  // Debug logging for permission issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Permission Debug:', {
        user: user?.email,
        profile: profile?.role,
        isCompanyUser: profile?.is_company_user,
        accountStatus: profile?.account_status,
        authLoading,
        permissionsLoading: loading
      });
    }
  }, [user?.email, profile?.role, profile?.is_company_user, profile?.account_status, authLoading, loading]);
  
  // Memoize user projects calculation with stable dependencies
  const userProjects = useMemo(() => {
    if (!user) return [];
    
    // Early admin access for authenticated users with company email
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    const isEarlyAdmin = hasCompanyEmail && !!user;
    
    // Full admin check with profile
    const isAdmin = profile?.role === 'admin' && 
                   profile?.is_company_user && 
                   profile?.account_status === 'approved';

    // Grant access if confirmed admin or early admin (while profile loads)
    if (isAdmin || isEarlyAdmin) {
      return projects.map(p => p.id);
    }

    // For non-admin users, require profile to be loaded
    if (!profile) return [];
    
    // Non-admin users - check specific assignments
    return projects
      .filter(p => p.project_manager_id === user.id)
      .map(p => p.id);
  }, [user?.id, user?.email, profile?.id, profile?.role, profile?.is_company_user, profile?.account_status, projects]);

  const canAccessProject = useMemo(() => (projectId: string): boolean => {
    if (!projectId || !user) return false;
    
    // Early admin access check
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    const isEarlyAdmin = hasCompanyEmail && !!user;
    
    const hasProjectAccess = userProjects.includes(projectId);
    const isAdmin = profile?.role === 'admin' && 
                   profile?.is_company_user && 
                   profile?.account_status === 'approved';
    
    return hasProjectAccess || isAdmin || isEarlyAdmin;
  }, [user, profile, userProjects]);

  const canAssignToProject = useMemo(() => (projectId: string): boolean => {
    if (!projectId || !user) return false;
    
    // Early admin access check
    const hasCompanyEmail = user.email?.includes('@austinkunzconstruction.com');
    const isEarlyAdmin = hasCompanyEmail && !!user;
    
    const hasBasicAccess = canAccessProject(projectId);
    const hasAssignmentRole = profile?.is_company_user && 
                             profile?.account_status === 'approved' &&
                             ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
    
    // Grant assignment permissions for early admin or confirmed role
    return hasBasicAccess && (hasAssignmentRole || isEarlyAdmin);
  }, [user, profile, canAccessProject]);

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects,
    sessionError: null
  };
};
