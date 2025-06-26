
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionHealth {
  isHealthy: boolean;
  frontendAuthenticated: boolean;
  backendAuthenticated: boolean;
  lastChecked: Date | null;
  error?: string;
}

interface ProjectPermissions {
  userProjects: string[];
  canAccessProject: (projectId: string) => boolean;
  canAssignToProject: (projectId: string) => boolean;
  loading: boolean;
  sessionError: string | null;
}

interface AuthSessionContextType {
  sessionHealth: SessionHealth;
  projectPermissions: ProjectPermissions;
  checkSessionHealth: () => Promise<SessionHealth>;
  validateSessionForOperation: (operationName: string) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
};

export const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [sessionHealth, setSessionHealth] = useState<SessionHealth>({
    isHealthy: false,
    frontendAuthenticated: false,
    backendAuthenticated: false,
    lastChecked: null
  });
  
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const checkSessionHealth = useCallback(async (): Promise<SessionHealth> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const frontendAuth = !!session?.user;

      if (!frontendAuth) {
        const health: SessionHealth = {
          isHealthy: false,
          frontendAuthenticated: false,
          backendAuthenticated: false,
          lastChecked: new Date(),
          error: 'No frontend session'
        };
        setSessionHealth(health);
        return health;
      }

      // Test backend connectivity with a simple query
      let backendAuth = false;
      let backendError = null;

      try {
        const { error: testError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .limit(1);

        backendAuth = !testError;
        backendError = testError;
      } catch (err) {
        backendAuth = false;
        backendError = err;
      }

      const health: SessionHealth = {
        isHealthy: frontendAuth,
        frontendAuthenticated: frontendAuth,
        backendAuthenticated: backendAuth,
        lastChecked: new Date(),
        error: backendError ? String(backendError) : undefined
      };

      setSessionHealth(health);
      return health;
    } catch (error) {
      const health: SessionHealth = {
        isHealthy: false,
        frontendAuthenticated: false,
        backendAuthenticated: false,
        lastChecked: new Date(),
        error: String(error)
      };
      setSessionHealth(health);
      return health;
    }
  }, []);

  const fetchUserProjects = useCallback(async () => {
    if (!user || !profile) {
      setUserProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Admin fallback - always allow access if user is admin
      const isAdmin = profile?.role === 'admin' && 
                     profile?.is_company_user && 
                     profile?.account_status === 'approved';

      const isAuthorizedUser = profile?.is_company_user && 
                              profile?.account_status === 'approved';

      if (isAdmin || isAuthorizedUser) {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id');

        if (error) {
          console.warn('Error fetching projects:', error);
          setSessionError(`Database error: ${error.message}`);
          setUserProjects([]);
        } else {
          const projectIds = projects?.map(p => p.id) || [];
          setUserProjects(projectIds);
          setSessionError(null);
        }
      } else {
        // Non-company users - check specific assignments
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id')
          .eq('project_manager_id', user.id);

        if (error) {
          console.warn('Error fetching user projects:', error);
          setSessionError(`Database error: ${error.message}`);
          setUserProjects([]);
        } else {
          const projectIds = projects?.map(p => p.id) || [];
          setUserProjects(projectIds);
          setSessionError(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProjects:', error);
      setUserProjects([]);
      setSessionError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const validateSessionForOperation = useCallback(async (operationName: string): Promise<boolean> => {
    const health = await checkSessionHealth();
    
    if (!health.frontendAuthenticated) {
      toast({
        title: `${operationName} Failed`,
        description: "Please sign in to continue.",
        variant: "destructive"
      });
      return false;
    }

    if (!health.backendAuthenticated && health.error) {
      console.warn(`Backend connectivity issue during ${operationName}:`, health.error);
    }

    return true;
  }, [checkSessionHealth, toast]);

  const refreshPermissions = useCallback(async () => {
    await Promise.all([
      checkSessionHealth(),
      fetchUserProjects()
    ]);
  }, [checkSessionHealth, fetchUserProjects]);

  // Initial load and user change effects
  useEffect(() => {
    if (user && profile) {
      fetchUserProjects();
      checkSessionHealth();
    } else {
      setUserProjects([]);
      setLoading(false);
      setSessionError(null);
    }
  }, [user?.id, profile?.id, fetchUserProjects, checkSessionHealth]);

  const projectPermissions = useMemo((): ProjectPermissions => {
    const canAccessProject = (projectId: string): boolean => {
      if (!projectId) return false;
      
      const hasProjectAccess = userProjects.includes(projectId);
      const isAdmin = profile?.role === 'admin' && 
                     profile?.is_company_user && 
                     profile?.account_status === 'approved';
      
      return hasProjectAccess || isAdmin;
    };

    const canAssignToProject = (projectId: string): boolean => {
      if (!projectId) return false;
      
      const hasBasicAccess = canAccessProject(projectId);
      const hasAssignmentRole = profile?.is_company_user && 
                               profile?.account_status === 'approved' &&
                               ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
      
      // Admin override - always allow if admin
      const isAdmin = profile?.role === 'admin' && 
                     profile?.is_company_user && 
                     profile?.account_status === 'approved';
      
      if (isAdmin) return true;
      
      const hasCriticalError = sessionError && sessionError.includes('Session validation failed');
      return hasBasicAccess && hasAssignmentRole && !hasCriticalError;
    };

    return {
      userProjects,
      canAccessProject,
      canAssignToProject,
      loading,
      sessionError
    };
  }, [userProjects, profile, loading, sessionError]);

  const contextValue = useMemo(() => ({
    sessionHealth,
    projectPermissions,
    checkSessionHealth,
    validateSessionForOperation,
    refreshPermissions
  }), [sessionHealth, projectPermissions, checkSessionHealth, validateSessionForOperation, refreshPermissions]);

  return (
    <AuthSessionContext.Provider value={contextValue}>
      {children}
    </AuthSessionContext.Provider>
  );
};
