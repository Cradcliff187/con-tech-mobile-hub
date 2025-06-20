
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const GanttLoadingState: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="flex">
            <div className="w-80 px-4 py-3 border-r border-slate-200">
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex-1 flex overflow-x-auto">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="px-2 py-1 border-r border-slate-200">
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`flex border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="w-80 px-4 py-3 border-r border-slate-200">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex-1 relative py-3 px-2">
                <div className="relative h-6 bg-slate-100 rounded">
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
