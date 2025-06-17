
import { MaintenanceTask } from '@/hooks/useMaintenanceTasks';
import type { Equipment } from '@/hooks/useEquipment';

// Updated to work with real MaintenanceTask data from the database
export const generateMaintenanceTasks = (equipment: Equipment[], tasks: MaintenanceTask[]): MaintenanceTask[] => {
  // Return real tasks from the database, already sorted by scheduled_date
  return tasks.map(task => ({
    ...task,
    equipmentId: task.equipment_id,
    equipmentName: task.equipment?.name || 'Unknown Equipment',
    type: task.task_type as 'routine' | 'repair' | 'inspection',
    priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
    scheduledDate: task.scheduled_date,
    estimatedHours: task.estimated_hours || 4,
    assignedTo: task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name,
    status: task.status as 'scheduled' | 'in-progress' | 'completed' | 'overdue',
    description: task.description || ''
  }));
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

// Helper function to format maintenance task data for the existing components
export const formatMaintenanceTaskForCard = (task: MaintenanceTask) => {
  return {
    id: task.id,
    equipmentId: task.equipment_id,
    equipmentName: task.equipment?.name || 'Unknown Equipment',
    type: task.task_type,
    priority: task.priority,
    scheduledDate: task.scheduled_date,
    estimatedHours: task.estimated_hours || 4,
    assignedTo: task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name,
    status: task.status,
    description: task.description || ''
  };
};
