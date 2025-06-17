
import { MaintenanceTask } from '@/types/maintenance';
import type { Equipment } from '@/hooks/useEquipment';

// Updated to work with real MaintenanceTask data from the database
export const generateMaintenanceTasks = (equipment: Equipment[], tasks: MaintenanceTask[]): MaintenanceTask[] => {
  // Return real tasks from the database, already sorted by scheduled_date
  return tasks;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': 
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
