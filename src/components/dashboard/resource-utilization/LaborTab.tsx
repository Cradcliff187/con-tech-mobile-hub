
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { getUtilizationStatus } from './utils';

interface LaborTabProps {
  laborUtilizationRate: number;
  activeWorkers: number;
  totalWorkers: number;
  totalHoursUsed: number;
  totalHoursAllocated: number;
}

export const LaborTab = ({
  laborUtilizationRate,
  activeWorkers,
  totalWorkers,
  totalHoursUsed,
  totalHoursAllocated
}: LaborTabProps) => {
  const laborStatus = getUtilizationStatus(laborUtilizationRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <CircularProgress
          percentage={laborUtilizationRate}
          label="Worker Utilization"
          value={`${activeWorkers}/${totalWorkers}`}
        />
      </div>
      
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${laborStatus.bg} ${laborStatus.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Active Workers</h3>
            <laborStatus.icon className={`h-4 w-4 ${laborStatus.color}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${laborStatus.color}`}>
              {activeWorkers}
            </span>
            <span className="text-sm text-slate-500">
              of {totalWorkers} total
            </span>
          </div>
          <Badge className="mt-2" variant="secondary">
            {laborStatus.label}
          </Badge>
        </div>

        <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Hours Utilization</h3>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">
                {totalHoursUsed}h
              </span>
              <span className="text-sm text-slate-500">
                of {totalHoursAllocated}h allocated
              </span>
            </div>
            <Progress 
              value={laborUtilizationRate} 
              className="h-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
