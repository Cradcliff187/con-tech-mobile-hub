
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, X } from 'lucide-react';
import { EquipmentAllocation } from '@/hooks/useEquipmentAllocations';
import { format, isAfter, isBefore, isToday } from 'date-fns';

interface EquipmentAllocationTimelineProps {
  allocations: EquipmentAllocation[];
  onRemoveAllocation?: (allocationId: string) => void;
  isLoading?: boolean;
}

export const EquipmentAllocationTimeline = ({ 
  allocations, 
  onRemoveAllocation,
  isLoading = false 
}: EquipmentAllocationTimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        <Calendar size={24} className="mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No current allocations</p>
      </div>
    );
  }

  const getStatusColor = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isAfter(today, end)) return 'bg-slate-100 text-slate-600'; // Past
    if (isBefore(today, start)) return 'bg-blue-100 text-blue-700'; // Future
    return 'bg-green-100 text-green-700'; // Current
  };

  const getStatusText = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isAfter(today, end)) return 'Completed';
    if (isBefore(today, start)) return 'Scheduled';
    return 'Active';
  };

  return (
    <div className="space-y-3">
      {allocations.map((allocation) => (
        <div
          key={allocation.id}
          className={`p-3 rounded-lg border ${getStatusColor(allocation.start_date, allocation.end_date)}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="font-medium text-sm">
                  {allocation.project?.name || 'Unknown Project'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {getStatusText(allocation.start_date, allocation.end_date)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    {format(new Date(allocation.start_date), 'MMM d')} - {format(new Date(allocation.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {onRemoveAllocation && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveAllocation(allocation.id)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
