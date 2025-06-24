
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseErrorRecoveryOptions {
  maxRetries?: number;
  baseRetryDelay?: number;
  onRecoverySuccess?: (operationId: string) => void;
  onRecoveryFailure?: (operationId: string, error: Error) => void;
}

export const useErrorRecovery = (options: UseErrorRecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    baseRetryDelay = 1000,
    onRecoverySuccess,
    onRecoveryFailure
  } = options;

  const [isRecovering, setIsRecovering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [hasFailedOperations, setHasFailedOperations] = useState(false);

  const generateOperationId = useCallback(() => {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    description: string,
    customMaxRetries?: number
  ): Promise<T> => {
    const operationId = generateOperationId();
    const effectiveMaxRetries = customMaxRetries ?? maxRetries;

    const attemptOperation = async (attemptNumber: number): Promise<T> => {
      try {
        const result = await operation();
        
        // Clean up on success
        setIsRecovering(false);
        setHasFailedOperations(false);

        if (onRecoverySuccess && attemptNumber > 1) {
          onRecoverySuccess(operationId);
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        setLastError(err);
        setRetryCount(attemptNumber);

        if (attemptNumber < effectiveMaxRetries) {
          const delay = baseRetryDelay * Math.pow(2, attemptNumber - 1);
          
          setIsRecovering(true);
          setHasFailedOperations(true);

          toast({
            title: "Operation Failed",
            description: `${description} failed. Retrying... (${attemptNumber}/${effectiveMaxRetries})`,
            variant: "destructive"
          });

          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptOperation(attemptNumber + 1);
        } else {
          setIsRecovering(false);
          setHasFailedOperations(true);

          if (onRecoveryFailure) {
            onRecoveryFailure(operationId, err);
          }

          toast({
            title: "Operation Failed",
            description: `${description} failed after ${effectiveMaxRetries} attempts`,
            variant: "destructive"
          });

          throw err;
        }
      }
    };

    return attemptOperation(1);
  }, [maxRetries, baseRetryDelay, onRecoverySuccess, onRecoveryFailure, generateOperationId]);

  const clearFailedOperations = useCallback(() => {
    setHasFailedOperations(false);
    setIsRecovering(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    isRecovering,
    hasFailedOperations,
    retryCount,
    lastError,
    executeWithRecovery,
    clearFailedOperations
  };
};
