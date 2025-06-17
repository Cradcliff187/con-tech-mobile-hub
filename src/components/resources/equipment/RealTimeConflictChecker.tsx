
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';

interface RealTimeConflictCheckerProps {
  equipmentId?: string;
  startDate: string;
  endDate: string;
  excludeAllocationId?: string;
  onConflictsChange: (conflicts: any[], hasConflicts: boolean) => void;
}

export const RealTimeConflictChecker = ({
  equipmentId,
  startDate,
  endDate,
  excludeAllocationId,
  onConflictsChange
}: RealTimeConflictCheckerProps) => {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);
  const { getConflictingAllocations } = useEquipmentAllocations();

  useEffect(() => {
    const checkConflicts = async () => {
      if (!equipmentId || !startDate || !endDate) {
        setConflicts([]);
        onConflictsChange([], false);
        return;
      }

      setChecking(true);
      
      try {
        const { conflicts: foundConflicts } = await getConflictingAllocations(
          equipmentId,
          startDate,
          endDate,
          excludeAllocationId
        );
        
        const conflictList = foundConflicts || [];
        setConflicts(conflictList);
        onConflictsChange(conflictList, conflictList.length > 0);
      } catch (error) {
        console.error('Error checking conflicts:', error);
        setConflicts([]);
        onConflictsChange([], false);
      } finally {
        setChecking(false);
      }
    };

    // Debounce the conflict checking
    const timer = setTimeout(checkConflicts, 300);
    return () => clearTimeout(timer);
  }, [equipmentId, startDate, endDate, excludeAllocationId, getConflictingAllocations, onConflictsChange]);

  if (!equipmentId || !startDate || !endDate) {
    return null;
  }

  return (
    <div className="space-y-2">
      {checking ? (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <Clock size={14} className="animate-spin" />
          <span>Checking for conflicts...</span>
        </div>
      ) : conflicts.length > 0 ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle size={16} />
            Equipment Allocation Conflicts ({conflicts.length})
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                <div className="font-medium">{conflict.project?.name || 'Unknown Project'}</div>
                <div className="text-xs">
                  {conflict.start_date} to {conflict.end_date}
                  {conflict.operator_stakeholder?.contact_person && (
                    <span> • Operator: {conflict.operator_stakeholder.contact_person}</span>
                  )}
                  {conflict.operator_user?.full_name && (
                    <span> • Operator: {conflict.operator_user.full_name}</span>
                  )}
                </div>
                {conflict.notes && (
                  <div className="text-xs mt-1 italic">Notes: {conflict.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={14} />
          <span>No conflicts detected - equipment is available</span>
        </div>
      )}
    </div>
  );
};
