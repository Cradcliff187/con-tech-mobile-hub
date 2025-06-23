
import { MaintenanceTask } from '@/types/maintenance';
import type { Equipment } from '@/hooks/useEquipment';

// Updated to work with real MaintenanceTask data from the database
export const generateMaintenanceTasks = (equipment: Equipment[], tasks: MaintenanceTask[]): MaintenanceTask[] => {
  // Return real tasks from the database, already sorted by scheduled_date
  return tasks;
};

// Legacy functions removed - these are now handled by GlobalStatusDropdown
// - getStatusColor() -> use GlobalStatusDropdown with entityType="maintenance_task"
// - getPriorityColor() -> moved to MaintenanceTaskCard as internal function

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
