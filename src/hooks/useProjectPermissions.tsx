
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMemo, useEffect } from 'react';

export const useProjectPermissions = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  
  // Development mode: No loading state - immediate permissions
  const loading = false;
  
  // Debug logging for permission issues
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Permission Debug (DEV MODE - BYPASS ALL CHECKS):', {
        user: user?.email,
        hasUser: !!user,
        projectCount: projects.length
      });
    }
  }, [user?.email, projects.length]);
  
  // Development mode: All authenticated users get full access to all projects
  const userProjects = useMemo(() => {
    if (!user) return [];
    // Grant full access to all projects for any authenticated user in development
    return projects.map(p => p.id);
  }, [user?.id, projects]);

  const canAccessProject = useMemo(() => (projectId: string): boolean => {
    // Development mode: Any authenticated user can access any project
    const result = !!user && !!projectId;
    console.log('🔐 canAccessProject (DEV BYPASS):', { projectId, hasUser: !!user, result });
    return result;
  }, [user]);

  const canAssignToProject = useMemo(() => (projectId: string): boolean => {
    // Development mode: Any authenticated user can assign to any project
    const result = !!user && !!projectId;
    console.log('🔐 canAssignToProject (DEV BYPASS):', { 
      projectId, 
      userEmail: user?.email,
      hasUser: !!user, 
      result 
    });
    return result;
  }, [user]);

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects,
    sessionError: null
  };
};
