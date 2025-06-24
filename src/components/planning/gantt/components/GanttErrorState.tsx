
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GanttErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const GanttErrorState = ({ error, onRetry }: GanttErrorStateProps) => {
  return (
    <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-slate-200">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Unable to Load Gantt Chart</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
