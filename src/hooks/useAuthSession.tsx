
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useMemo } from 'react';

interface SessionHealth {
  isHealthy: boolean;
  frontendAuthenticated: boolean;
  backendAuthenticated: boolean;
  lastChecked: Date | null;
  error?: string;
}

export const useAuthSession = () => {
  const { user, profile, loading } = useAuth();
  
  const sessionHealth = useMemo((): SessionHealth => ({
    isHealthy: !!user && !!profile,
    frontendAuthenticated: !!user,
    backendAuthenticated: !!profile,
    lastChecked: new Date(),
    error: undefined
  }), [user, profile]);

  const checkSessionHealth = useCallback(async (): Promise<SessionHealth> => {
    return sessionHealth;
  }, [sessionHealth]);

  const validateSessionForOperation = useCallback(async (operationName: string): Promise<boolean> => {
    console.log(`Validating session for: ${operationName}`);
    return sessionHealth.frontendAuthenticated;
  }, [sessionHealth.frontendAuthenticated]);
  
  return {
    sessionHealth,
    checkSessionHealth,
    validateSessionForOperation
  };
};
