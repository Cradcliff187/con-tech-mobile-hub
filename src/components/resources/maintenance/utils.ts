
import { MaintenanceTask } from './types';
import type { Equipment } from '@/types/database';

export const generateMaintenanceTasks = (equipment: Equipment[]): MaintenanceTask[] => {
  const tasks: MaintenanceTask[] = [];
  
  equipment.forEach((item, index) => {
    // Only generate tasks for equipment that needs maintenance
    if (item.maintenance_due) {
      const dueDate = new Date(item.maintenance_due);
      const today = new Date();
      const isOverdue = dueDate < today;
      
      tasks.push({
        id: `maintenance-${item.id}-${index}`,
        equipmentId: item.id,
        equipmentName: item.name || 'Unknown Equipment',
        type: 'routine',
        priority: isOverdue ? 'critical' : 'medium',
        scheduledDate: item.maintenance_due,
        estimatedHours: 4, // Default estimate
        status: isOverdue ? 'overdue' : 'scheduled',
        description: `Routine maintenance for ${item.name || 'equipment'}`
      });
    }
  });
  
  return tasks.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
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
