
import React from 'react';

export const TimelineLoadingState: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
