
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
        
        // Success - clean up any failed operation tracking
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
          // Calculate exponential backoff delay
          const delay = baseRetryDelay * Math.pow(2, attemptNumber - 1);
          
          // Store failed operation
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

          // Schedule retry
          const timeoutId = setTimeout(() => {
            attemptOperation(attemptNumber + 1);
            timeoutRefs.current.delete(operationId);
          }, delay);

          timeoutRefs.current.set(operationId, timeoutId);

          toast({
            title: "Operation Failed",
            description: `${description} failed. Retrying in ${delay}ms... (${attemptNumber}/${effectiveMaxRetries})`,
            variant: "destructive"
          });

          throw err;
        } else {
          // Max retries reached
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
            description: `${description} failed after ${effectiveMaxRetries} attempts: ${err.message}`,
            variant: "destructive"
          });

          throw err;
        }
      }
    };

    return attemptOperation(1);
  }, [maxRetries, baseRetryDelay, onRecoverySuccess, onRecoveryFailure, generateOperationId]);

  const retryFailedOperation = useCallback(async (operationId: string): Promise<boolean> => {
    const failedOp = failedOperations.get(operationId);
    if (!failedOp) return false;

    try {
      setIsRecovering(true);
      await failedOp.operation();
      
      setFailedOperations(prev => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });
      
      setIsRecovering(false);

      toast({
        title: "Retry Successful",
        description: `${failedOp.description} completed successfully`,
      });

      return true;
    } catch (error) {
      setIsRecovering(false);
      
      toast({
        title: "Retry Failed",
        description: `${failedOp.description} still failing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [failedOperations]);

  const clearFailedOperations = useCallback(() => {
    // Clear all pending timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();

    setFailedOperations(new Map());
    setIsRecovering(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  const rollbackToLastGoodState = useCallback(async (rollbackOperation: () => Promise<void>) => {
    try {
      setIsRecovering(true);
      await rollbackOperation();
      clearFailedOperations();
      
      toast({
        title: "Rollback Successful",
        description: "Restored to last known good state",
      });
    } catch (error) {
      setIsRecovering(false);
      
      toast({
        title: "Rollback Failed",
        description: error instanceof Error ? error.message : "Failed to rollback",
        variant: "destructive"
      });
    }
  }, [clearFailedOperations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  return {
    // State
    isRecovering,
    failedOperations: Array.from(failedOperations.values()),
    hasFailedOperations: failedOperations.size > 0,
    retryCount,
    lastError,
    
    // Actions
    executeWithRecovery,
    retryFailedOperation,
    clearFailedOperations,
    rollbackToLastGoodState
  };
};
