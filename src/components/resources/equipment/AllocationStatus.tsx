
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Briefcase } from 'lucide-react';
import type { EquipmentAllocation } from '@/hooks/useEquipmentAllocations';

interface AllocationStatusProps {
  allocation?: EquipmentAllocation;
  compact?: boolean;
}

export const AllocationStatus = ({ allocation, compact = false }: AllocationStatusProps) => {
  if (!allocation) {
    return <Badge variant="secondary">Available</Badge>;
  }

  const operatorName = allocation.operator_stakeholder?.contact_person || 
                      allocation.operator_stakeholder?.company_name ||
                      allocation.operator_user?.full_name ||
                      'Unknown Operator';

  const isActive = new Date(allocation.start_date) <= new Date() && 
                   new Date() <= new Date(allocation.end_date);
  
  const isUpcoming = new Date(allocation.start_date) > new Date();
  const isPast = new Date(allocation.end_date) < new Date();

  const statusColor = isActive ? 'destructive' : isUpcoming ? 'default' : 'secondary';

  if (compact) {
    return (
      <div className="space-y-1">
        <Badge variant={statusColor}>
          {isActive ? 'In Use' : isUpcoming ? 'Scheduled' : 'Past Allocation'}
        </Badge>
        <div className="text-xs text-slate-600">
          {allocation.project?.name} - {operatorName}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-slate-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <Badge variant={statusColor}>
          {isActive ? 'Currently Allocated' : isUpcoming ? 'Scheduled' : 'Past Allocation'}
        </Badge>
        <span className="text-xs text-slate-500">
          {allocation.start_date} to {allocation.end_date}
        </span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase size={12} />
          <span className="font-medium">{allocation.project?.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <User size={12} />
          <span>{operatorName}</span>
          <Badge variant="outline" className="text-xs">
            {allocation.operator_type === 'employee' ? 'Employee' : 'Internal User'}
          </Badge>
        </div>

        {allocation.task && (
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span className="text-slate-600">Task: {allocation.task.title}</span>
          </div>
        )}

        {allocation.notes && (
          <div className="text-xs text-slate-600 mt-1">
            {allocation.notes}
          </div>
        )}
      </div>
    </div>
  );
};
