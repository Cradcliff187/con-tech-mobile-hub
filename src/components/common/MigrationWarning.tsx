
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';

interface MigrationWarningProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'warning' | 'info' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const MigrationWarning = ({
  title,
  message,
  actionLabel,
  onAction,
  type = 'warning',
  dismissible = false,
  onDismiss
}: MigrationWarningProps) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Database className="h-4 w-4 text-blue-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-amber-600" />;
    }
  };

  const getAlertClasses = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-amber-200 bg-amber-50';
    }
  };

  return (
    <Alert className={`${getAlertClasses()} mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 mb-1">{title}</h4>
            <AlertDescription className="text-sm text-slate-700">
              {message}
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              className="text-xs"
            >
              {actionLabel}
            </Button>
          )}
          {dismissible && onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs p-1"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};
