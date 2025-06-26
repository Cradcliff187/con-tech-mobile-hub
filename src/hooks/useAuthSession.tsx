
import { useAuthSession as useAuthSessionContext } from '@/contexts/AuthSessionContext';

export const useAuthSession = () => {
  const { sessionHealth, checkSessionHealth, validateSessionForOperation } = useAuthSessionContext();
  
  return {
    sessionHealth,
    checkSessionHealth,
    validateSessionForOperation
  };
};
