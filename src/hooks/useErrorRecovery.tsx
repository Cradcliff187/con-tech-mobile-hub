
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface FailedOperation {
  id: string;
  operation: () => Promise<any>;
  retryCount: number;
  maxRetries: number;
  lastAttempt: number;
  error: Error;
  description: string;
}

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
  const [failedOperations, setFailedOperations] = useState<Map<string, FailedOperation>>(new Map());
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
        setFailedOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(operationId);
          return newMap;
        });
        
        setIsRecovering(false);

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
          
          const failedOp: FailedOperation = {
            id: operationId,
            operation,
            retryCount: attemptNumber,
            maxRetries: effectiveMaxRetries,
            lastAttempt: Date.now(),
            error: err,
            description
          };

          setFailedOperations(prev => {
            const newMap = new Map(prev);
            newMap.set(operationId, failedOp);
            return newMap;
          });

          setIsRecovering(true);

          const timeoutId = setTimeout(() => {
            attemptOperation(attemptNumber + 1);
            timeoutRefs.current.delete(operationId);
          }, delay);

          timeoutRefs.current.set(operationId, timeoutId);

          toast({
            title: "Operation Failed",
            description: `${description} failed. Retrying... (${attemptNumber}/${effectiveMaxRetries})`,
            variant: "destructive"
          });

          throw err;
        } else {
          setFailedOperations(prev => {
            const newMap = new Map(prev);
            newMap.delete(operationId);
            return newMap;
          });
          
          setIsRecovering(false);

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
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setFailedOperations(new Map());
    setIsRecovering(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  return {
    isRecovering,
    failedOperations: Array.from(failedOperations.values()),
    hasFailedOperations: failedOperations.size > 0,
    retryCount,
    lastError,
    executeWithRecovery,
    clearFailedOperations
  };
};
