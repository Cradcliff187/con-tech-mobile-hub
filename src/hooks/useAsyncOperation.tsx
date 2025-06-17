
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (result?: any) => void;
  onError?: (error: Error) => void;
}

export const useAsyncOperation = (options: UseAsyncOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const {
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError
  } = options;

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      
      if (successMessage && showSuccessToast) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage || error.message,
          variant: "destructive",
        });
      }
      
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [successMessage, errorMessage, showSuccessToast, showErrorToast, onSuccess, onError, toast]);

  const retry = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { execute, loading, error, retry, reset };
};
