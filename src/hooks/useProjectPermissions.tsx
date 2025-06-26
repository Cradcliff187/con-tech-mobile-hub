
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
        console.log('Fetching user projects for:', {
          userId: user.id,
          userEmail: user.email,
          profileRole: profile?.role,
          isCompanyUser: profile?.is_company_user,
          accountStatus: profile?.account_status
        });

        // Validate session but don't fail completely if there are issues
        const sessionValid = await validateSessionForOperation('Project Access Check');
        if (!sessionValid) {
          setSessionError('Session validation failed');
          // Still continue to try with profile-based permissions
        } else {
          setSessionError(null);
        }

        // Use direct profile-based permission check as primary method
        const isAuthorizedUser = profile?.is_company_user && 
                                profile?.account_status === 'approved';

        console.log('Authorization check:', {
          isAuthorizedUser,
          profileData: profile
        });

        if (isAuthorizedUser) {
          // Authorized company users can access all projects
          try {
            const { data: projects, error } = await supabase
              .from('projects')
              .select('id');

            if (error) {
              console.error('Error fetching projects:', error);
              setSessionError(`Database error: ${error.message}`);
              setUserProjects([]);
            } else {
              const projectIds = projects?.map(p => p.id) || [];
              console.log('Fetched projects:', projectIds.length);
              setUserProjects(projectIds);
            }
          } catch (dbError) {
            console.error('Database query failed:', dbError);
            setSessionError('Database connection failed');
            setUserProjects([]);
          }
        } else {
          // Non-company users or pending approval - check specific project assignments
          try {
            const { data: projects, error } = await supabase
              .from('projects')
              .select('id')
              .eq('project_manager_id', user.id);

            if (error) {
              console.error('Error fetching user-specific projects:', error);
              setSessionError(`Database error: ${error.message}`);
              setUserProjects([]);
            } else {
              const projectIds = projects?.map(p => p.id) || [];
              console.log('User-specific projects:', projectIds.length);
              setUserProjects(projectIds);
            }
          } catch (dbError) {
            console.error('User-specific query failed:', dbError);
            setSessionError('Database connection failed');
            setUserProjects([]);
          }
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
  }, [user, profile, sessionHealth.lastChecked]);

  const canAccessProject = (projectId: string): boolean => {
    if (!projectId) return false;
    
    // Primary check: user has explicit access to this project
    const hasProjectAccess = userProjects.includes(projectId);
    
    // Fallback: admin users should always have access
    const isAdmin = profile?.role === 'admin' && 
                   profile?.is_company_user && 
                   profile?.account_status === 'approved';
    
    console.log('canAccessProject check:', {
      projectId,
      hasProjectAccess,
      isAdmin,
      userProjectsCount: userProjects.length,
      result: hasProjectAccess || isAdmin
    });
    
    return hasProjectAccess || isAdmin;
  };

  const canAssignToProject = (projectId: string): boolean => {
    if (!projectId) return false;
    
    // Check basic project access first
    const hasBasicAccess = canAccessProject(projectId);
    
    // Check role-based assignment permissions
    const hasAssignmentRole = profile?.is_company_user && 
                             profile?.account_status === 'approved' &&
                             ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
    
    console.log('canAssignToProject check:', {
      projectId,
      hasBasicAccess,
      hasAssignmentRole,
      profileRole: profile?.role,
      sessionError,
      result: hasBasicAccess && hasAssignmentRole && !sessionError
    });
    
    // Only fail on assignment if there's a critical session error
    const hasCriticalError = sessionError && sessionError.includes('Session validation failed');
    
    return hasBasicAccess && hasAssignmentRole && !hasCriticalError;
  };

  return {
    canAccessProject,
    canAssignToProject,
    loading,
    userProjects,
    sessionError
  };
};
