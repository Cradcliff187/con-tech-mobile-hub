
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Database, RefreshCw, CheckCircle, X } from 'lucide-react';

interface MigrationWarningProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'warning' | 'info' | 'error' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
  progress?: number;
  isLoading?: boolean;
  showDetails?: boolean;
  details?: string[];
}

export const MigrationWarning: React.FC<MigrationWarningProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  type = 'warning',
  dismissible = false,
  onDismiss,
  progress,
  isLoading = false,
  showDetails = false,
  details = []
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <RefreshCw className={`h-4 w-4 text-amber-600 ${isLoading ? 'animate-spin' : ''}`} />;
    }
  };

  const getAlertClasses = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-amber-200 bg-amber-50';
    }
  };

  return (
    <Alert className={`${getAlertClasses()} mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 mb-1">{title}</h4>
            <AlertDescription className="text-sm text-slate-700 mb-3">
              {message}
            </AlertDescription>
            
            {/* Progress Bar */}
            {typeof progress === 'number' && (
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-slate-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {/* Details List */}
            {showDetails && details.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-medium text-slate-600 mb-2">Details:</div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 shrink-0"></span>
                      <span className="break-words">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4 shrink-0">
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              disabled={isLoading}
              className="text-xs touch-manipulation min-h-[36px]"
            >
              {isLoading ? 'Processing...' : actionLabel}
            </Button>
          )}
          {dismissible && onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs p-1 touch-manipulation min-h-[36px] min-w-[36px]"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default MigrationWarning;
