
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAsyncOperation = (options: UseAsyncOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Memoize the options to prevent unnecessary recreations
  const memoizedOptions = useMemo(() => options, [
    options.successMessage,
    options.errorMessage,
    options.onSuccess,
    options.onError
  ]);

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      
      if (memoizedOptions.successMessage) {
        toast({
          title: "Success",
          description: memoizedOptions.successMessage,
        });
      }
      
      memoizedOptions.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      setError(error);
      
      toast({
        title: "Error",
        description: memoizedOptions.errorMessage || error.message,
        variant: "destructive",
      });
      
      memoizedOptions.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [memoizedOptions, toast]);

  const retry = useCallback(() => {
    setError(null);
  }, []);

  return { execute, loading, error, retry };
};
