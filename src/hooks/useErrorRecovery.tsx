
import React, { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorRecoveryState {
  isRecovering: boolean;
  failedOperations: Map<string, FailedOperation>;
  retryCount: number;
  lastError: Error | null;
}

interface FailedOperation {
  id: string;
  operation: () => Promise<any>;
  retryCount: number;
  maxRetries: number;
  lastAttempt: number;
  error: Error;
  description: string;
}

interface UseErrorRecoveryProps {
  maxRetries?: number;
  baseRetryDelay?: number;
  onRecoverySuccess?: (operationId: string) => void;
  onRecoveryFailure?: (operationId: string, error: Error) => void;
}

export const useErrorRecovery = ({
  maxRetries = 3,
  baseRetryDelay = 1000,
  onRecoverySuccess,
  onRecoveryFailure
}: UseErrorRecoveryProps = {}) => {
  const [state, setState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    failedOperations: new Map(),
    retryCount: 0,
    lastError: null
  });

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateOperationId = () => `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
        
        // Operation succeeded, clean up any existing failed operation
        setState(prev => {
          const newFailedOperations = new Map(prev.failedOperations);
          newFailedOperations.delete(operationId);
          return {
            ...prev,
            failedOperations: newFailedOperations,
            isRecovering: false
          };
        });

        if (onRecoverySuccess && attemptNumber > 1) {
          onRecoverySuccess(operationId);
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        setState(prev => ({
          ...prev,
          lastError: err,
          retryCount: attemptNumber
        }));

        if (attemptNumber < effectiveMaxRetries) {
          // Calculate exponential backoff delay
          const delay = baseRetryDelay * Math.pow(2, attemptNumber - 1);
          
          // Store failed operation for potential manual retry
          const failedOp: FailedOperation = {
            id: operationId,
            operation,
            retryCount: attemptNumber,
            maxRetries: effectiveMaxRetries,
            lastAttempt: Date.now(),
            error: err,
            description
          };

          setState(prev => {
            const newFailedOperations = new Map(prev.failedOperations);
            newFailedOperations.set(operationId, failedOp);
            return {
              ...prev,
              failedOperations: newFailedOperations,
              isRecovering: true
            };
          });

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

          throw err; // Re-throw to maintain error flow
        } else {
          // Max retries reached
          setState(prev => {
            const newFailedOperations = new Map(prev.failedOperations);
            newFailedOperations.delete(operationId);
            return {
              ...prev,
              failedOperations: newFailedOperations,
              isRecovering: false
            };
          });

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
  }, [maxRetries, baseRetryDelay, onRecoverySuccess, onRecoveryFailure]);

  const retryFailedOperation = useCallback(async (operationId: string) => {
    const failedOp = state.failedOperations.get(operationId);
    if (!failedOp) return false;

    try {
      setState(prev => ({ ...prev, isRecovering: true }));
      await failedOp.operation();
      
      setState(prev => {
        const newFailedOperations = new Map(prev.failedOperations);
        newFailedOperations.delete(operationId);
        return {
          ...prev,
          failedOperations: newFailedOperations,
          isRecovering: false
        };
      });

      toast({
        title: "Retry Successful",
        description: `${failedOp.description} completed successfully`,
      });

      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isRecovering: false }));
      
      toast({
        title: "Retry Failed",
        description: `${failedOp.description} still failing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [state.failedOperations]);

  const clearFailedOperations = useCallback(() => {
    // Clear all pending timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();

    setState(prev => ({
      ...prev,
      failedOperations: new Map(),
      isRecovering: false,
      retryCount: 0,
      lastError: null
    }));
  }, []);

  const rollbackToLastGoodState = useCallback(async (rollbackOperation: () => Promise<void>) => {
    try {
      setState(prev => ({ ...prev, isRecovering: true }));
      await rollbackOperation();
      clearFailedOperations();
      
      toast({
        title: "Rollback Successful",
        description: "Restored to last known good state",
      });
    } catch (error) {
      setState(prev => ({ ...prev, isRecovering: false }));
      
      toast({
        title: "Rollback Failed",
        description: error instanceof Error ? error.message : "Failed to rollback",
        variant: "destructive"
      });
    }
  }, [clearFailedOperations]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  return {
    // State
    isRecovering: state.isRecovering,
    failedOperations: Array.from(state.failedOperations.values()),
    hasFailedOperations: state.failedOperations.size > 0,
    retryCount: state.retryCount,
    lastError: state.lastError,
    
    // Actions
    executeWithRecovery,
    retryFailedOperation,
    clearFailedOperations,
    rollbackToLastGoodState
  };
};
