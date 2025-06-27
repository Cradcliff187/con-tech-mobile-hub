
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, Database } from 'lucide-react';

interface AssignmentError {
  type: 'network' | 'database' | 'validation' | 'permission' | 'unknown';
  message: string;
  details?: string;
  retryable?: boolean;
}

interface AssignmentErrorHandlerProps {
  error: AssignmentError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case 'network': return <Wifi className="h-4 w-4" />;
    case 'database': return <Database className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const getErrorTitle = (type: string) => {
  switch (type) {
    case 'network': return 'Connection Error';
    case 'database': return 'Database Error';
    case 'validation': return 'Validation Error';
    case 'permission': return 'Permission Error';
    default: return 'Assignment Error';
  }
};

const getErrorSuggestion = (type: string) => {
  switch (type) {
    case 'network': return 'Check your internet connection and try again.';
    case 'database': return 'Database operation failed. Please try again or contact support.';
    case 'validation': return 'Please check the assignment details and correct any issues.';
    case 'permission': return 'You may not have permission to perform this action.';
    default: return 'An unexpected error occurred. Please try again.';
  }
};

export const AssignmentErrorHandler: React.FC<AssignmentErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-start gap-2">
        {getErrorIcon(error.type)}
        <div className="flex-1 min-w-0">
          <div className="font-medium">{getErrorTitle(error.type)}</div>
          <AlertDescription className="mt-1">
            <div className="space-y-2">
              <div>{error.message}</div>
              {error.details && (
                <div className="text-xs bg-red-50 p-2 rounded border">
                  <strong>Details:</strong> {error.details}
                </div>
              )}
              <div className="text-sm text-red-700">
                {getErrorSuggestion(error.type)}
              </div>
            </div>
          </AlertDescription>
          
          <div className="flex gap-2 mt-3">
            {error.retryable && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export const createAssignmentError = (
  error: unknown,
  operation: string
): AssignmentError => {
  console.error(`Assignment ${operation} error:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        message: `Network error during ${operation}`,
        details: error.message,
        retryable: true
      };
    }
    
    // Database errors
    if (message.includes('database') || message.includes('sql') || message.includes('relation')) {
      return {
        type: 'database',
        message: `Database error during ${operation}`,
        details: error.message,
        retryable: true
      };
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return {
        type: 'permission',
        message: `Permission denied for ${operation}`,
        details: error.message,
        retryable: false
      };
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: 'validation',
        message: `Validation failed for ${operation}`,
        details: error.message,
        retryable: false
      };
    }
  }

  // Unknown error
  return {
    type: 'unknown',
    message: `Unexpected error during ${operation}`,
    details: error instanceof Error ? error.message : String(error),
    retryable: true
  };
};
