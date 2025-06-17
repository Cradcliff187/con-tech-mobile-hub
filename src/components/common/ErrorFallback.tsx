
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  className?: string;
}

export const ErrorFallback = ({ 
  error, 
  resetError, 
  title = "Something went wrong",
  description,
  showHomeButton = false,
  className = "max-w-md mx-auto"
}: ErrorFallbackProps) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={className}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{description || error?.message || 'An unexpected error occurred'}</p>
          
          <div className="flex gap-2">
            {resetError && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetError}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
