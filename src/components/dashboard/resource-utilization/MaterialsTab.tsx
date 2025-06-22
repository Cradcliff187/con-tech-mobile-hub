
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle } from 'lucide-react';

export const MaterialsTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-600 text-center">Materials Tracking</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Status</h3>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Materials tracking is not yet available.
            </p>
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Future Features</h3>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Material usage tracking</p>
            <p>• Delivery management</p>
            <p>• Stock level monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};
