
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { getUtilizationStatus } from './utils';

interface EquipmentTabProps {
  equipmentUtilizationRate: number;
  inUse: number;
  totalEquipment: number;
  maintenanceCount: number;
}

export const EquipmentTab = ({
  equipmentUtilizationRate,
  inUse,
  totalEquipment,
  maintenanceCount
}: EquipmentTabProps) => {
  const equipmentStatus = getUtilizationStatus(equipmentUtilizationRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <CircularProgress
          percentage={equipmentUtilizationRate}
          label="Equipment Utilization"
          value={`${inUse}/${totalEquipment}`}
        />
      </div>
      
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${equipmentStatus.bg} ${equipmentStatus.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Equipment In Use</h3>
            <equipmentStatus.icon className={`h-4 w-4 ${equipmentStatus.color}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${equipmentStatus.color}`}>
              {inUse}
            </span>
            <span className="text-sm text-slate-500">
              of {totalEquipment} total
            </span>
          </div>
          <Badge className="mt-2" variant="secondary">
            {equipmentStatus.label}
          </Badge>
        </div>

        <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Maintenance Status</h3>
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">
              {maintenanceCount}
            </span>
            <span className="text-sm text-slate-500">tasks pending</span>
            {maintenanceCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                Scheduled
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
