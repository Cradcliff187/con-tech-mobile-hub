import React from 'react';
import { Users } from 'lucide-react';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceTasksContext } from '@/contexts/MaintenanceTasksContext';
import { CompactMetricCard } from './CompactMetricCard';

interface CompactResourceCardProps {
  onClick?: () => void;
  className?: string;
}

export const CompactResourceCard = ({ onClick, className }: CompactResourceCardProps) => {
  const { allocations, loading: allocationsLoading } = useResourceAllocations();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { tasks: maintenanceTasks, loading: maintenanceLoading } = useMaintenanceTasksContext();

  const loading = allocationsLoading || equipmentLoading || maintenanceLoading;

  if (loading) {
    return (
      <CompactMetricCard
        icon={Users}
        title="Resources"
        value=""
        subtitle=""
        color="text-slate-500"
        onClick={onClick}
        loading={true}
        className={className}
      />
    );
  }

  // Calculate metrics (same logic as ResourceUtilization)
  const allMembers = allocations.flatMap(a => a.members || []);
  const totalHoursUsed = allMembers.reduce((sum, m) => sum + m.hours_used, 0);
  const totalHoursAllocated = allMembers.reduce((sum, m) => sum + m.hours_allocated, 0);
  const laborUtilizationRate = totalHoursAllocated > 0 ? Math.round((totalHoursUsed / totalHoursAllocated) * 100) : 0;

  const inUse = equipment.filter(e => e.status === 'in-use').length;
  const available = equipment.filter(e => e.status === 'available').length;
  const totalEquipment = inUse + available;
  const equipmentUtilizationRate = totalEquipment > 0 ? Math.round((inUse / totalEquipment) * 100) : 0;

  // Combined utilization rate (average of labor and equipment)
  const combinedUtilization = Math.round((laborUtilizationRate + equipmentUtilizationRate) / 2);

  // Count active conflicts (maintenance tasks)
  const conflictsCount = maintenanceTasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;

  // Color coding based on utilization
  const color = combinedUtilization >= 85 
    ? 'text-green-600' 
    : combinedUtilization >= 70
    ? 'text-orange-600'
    : 'text-red-600';

  const subtitle = conflictsCount === 0 
    ? 'No conflicts' 
    : `${conflictsCount} conflict${conflictsCount === 1 ? '' : 's'}`;

  return (
    <CompactMetricCard
      icon={Users}
      title="Resources"
      value={`${combinedUtilization}%`}
      subtitle={subtitle}
      color={color}
      onClick={onClick}
      className={className}
    />
  );
};