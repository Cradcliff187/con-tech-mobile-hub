
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionHealth {
  isHealthy: boolean;
  frontendAuthenticated: boolean;
  backendAuthenticated: boolean;
  lastChecked: Date | null;
  error?: string;
}

export const useAuthSession = () => {
  const [sessionHealth, setSessionHealth] = useState<SessionHealth>({
    isHealthy: false,
    frontendAuthenticated: false,
    backendAuthenticated: false,
    lastChecked: null
  });
  const { toast } = useToast();

  const checkSessionHealth = async () => {
    try {
      // Check frontend session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const frontendAuth = !!session?.user;

      console.log('Session health check:', {
        hasSession: frontendAuth,
        userId: session?.user?.id,
        sessionError
      });

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

      // Test backend connectivity with a simple, non-critical query
      let backendAuth = false;
      let backendError = null;

      try {
        // Try a simple query to test RLS connectivity
        const { data: testQuery, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .limit(1);

        backendAuth = !testError;
        backendError = testError;

        console.log('Backend test query:', {
          success: backendAuth,
          error: testError,
          hasData: !!testQuery
        });
      } catch (err) {
        console.warn('Backend connectivity test failed:', err);
        backendError = err;
        backendAuth = false;
      }

      const health: SessionHealth = {
        isHealthy: frontendAuth, // Be more lenient - focus on frontend auth
        frontendAuthenticated: frontendAuth,
        backendAuthenticated: backendAuth,
        lastChecked: new Date(),
        error: backendError ? String(backendError) : undefined
      };

      setSessionHealth(health);

      // Only try to refresh session if there's a clear backend issue
      if (frontendAuth && !backendAuth && backendError) {
        console.log('Detected potential session issue, attempting refresh...');
        try {
          await supabase.auth.refreshSession();
        } catch (refreshError) {
          console.warn('Session refresh failed:', refreshError);
        }
      }

      return health;
    } catch (error) {
      console.error('Session health check failed completely:', error);
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
  };

  const validateSessionForOperation = async (operationName: string) => {
    const health = await checkSessionHealth();
    
    // Be more lenient - only fail if there's no frontend authentication
    if (!health.frontendAuthenticated) {
      toast({
        title: `${operationName} Failed`,
        description: "Please sign in to continue.",
        variant: "destructive"
      });
      return false;
    }

    // Warn about backend issues but don't block operations
    if (!health.backendAuthenticated && health.error) {
      console.warn(`Backend connectivity issue during ${operationName}:`, health.error);
      // Don't show toast for backend issues as they may be temporary
    }

    return true;
  };

  return {
    sessionHealth,
    checkSessionHealth,
    validateSessionForOperation
  };
};
