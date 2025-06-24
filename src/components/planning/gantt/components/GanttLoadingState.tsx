
import React from 'react';
import { Loader2 } from 'lucide-react';

export const GanttLoadingState = () => {
  return (
    <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-slate-200">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Loading Gantt Chart</h3>
        <p className="text-sm text-slate-500">Fetching project tasks and timeline...</p>
      </div>
    </div>
  );
};
