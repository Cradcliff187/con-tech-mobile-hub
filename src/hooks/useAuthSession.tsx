
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionHealth {
  isHealthy: boolean;
  frontendAuthenticated: boolean;
  backendAuthenticated: boolean;
  lastChecked: Date | null;
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

      // Check backend auth by calling a simple RLS-protected function
      const { data: backendCheck, error: backendError } = await supabase
        .rpc('is_approved_company_user');

      const backendAuth = !backendError && backendCheck !== null;

      const health: SessionHealth = {
        isHealthy: frontendAuth && backendAuth,
        frontendAuthenticated: frontendAuth,
        backendAuthenticated: backendAuth,
        lastChecked: new Date()
      };

      setSessionHealth(health);

      // If there's a mismatch, try to refresh the session
      if (frontendAuth && !backendAuth) {
        console.warn('Session mismatch detected, attempting refresh...');
        await supabase.auth.refreshSession();
        
        // Recheck after refresh
        const { data: recheckData, error: recheckError } = await supabase
          .rpc('is_approved_company_user');
        
        if (recheckError) {
          toast({
            title: "Authentication Issue",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive"
          });
        }
      }

      return health;
    } catch (error) {
      console.error('Session health check failed:', error);
      const health: SessionHealth = {
        isHealthy: false,
        frontendAuthenticated: false,
        backendAuthenticated: false,
        lastChecked: new Date()
      };
      setSessionHealth(health);
      return health;
    }
  };

  const validateSessionForOperation = async (operationName: string) => {
    const health = await checkSessionHealth();
    
    if (!health.isHealthy) {
      toast({
        title: `${operationName} Failed`,
        description: !health.frontendAuthenticated 
          ? "Please sign in to continue."
          : "Session expired. Please refresh the page and try again.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    sessionHealth,
    checkSessionHealth,
    validateSessionForOperation
  };
};
