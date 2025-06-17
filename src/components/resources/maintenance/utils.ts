
import { MaintenanceTask } from './types';
import { Equipment } from '@/hooks/useEquipment';

export const generateMaintenanceTasks = (equipment: Equipment[]): MaintenanceTask[] => {
  const tasks: MaintenanceTask[] = [];
  const today = new Date();

  equipment.forEach(item => {
    if (item.maintenance_due) {
      const maintenanceDate = new Date(item.maintenance_due);
      const isOverdue = maintenanceDate < today;
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' = 'scheduled';
      
      if (isOverdue) {
        priority = 'critical';
        status = 'overdue';
      } else if (daysUntilMaintenance <= 7) {
        priority = 'high';
      } else if (daysUntilMaintenance <= 30) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      // Determine maintenance type based on equipment type
      let maintenanceType: 'routine' | 'repair' | 'inspection' = 'routine';
      if (item.type?.toLowerCase().includes('crane') || item.type?.toLowerCase().includes('lift')) {
        maintenanceType = 'inspection';
      } else if (item.status === 'maintenance') {
        maintenanceType = 'repair';
      }

      // Estimate hours based on equipment type and maintenance type
      let estimatedHours = 4;
      if (maintenanceType === 'repair') {
        estimatedHours = 8;
      } else if (maintenanceType === 'inspection') {
        estimatedHours = 2;
      }

      tasks.push({
        id: item.id,
        equipmentId: item.id,
        equipmentName: item.name,
        type: maintenanceType,
        priority,
        scheduledDate: item.maintenance_due,
        estimatedHours,
        assignedTo: item.operator?.full_name,
        status,
        description: `${maintenanceType === 'routine' ? 'Routine maintenance' : 
                     maintenanceType === 'repair' ? 'Repair work required' : 
                     'Safety inspection'} for ${item.name}`
      });
    }
  });

  // Sort by priority and date
  tasks.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  return tasks;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

export const getStatusIcon = (status: string) => {
  const { CheckCircle, Clock, AlertTriangle, CalendarDays } = require('lucide-react');
  
  switch (status) {
    case 'completed': return CheckCircle({ size: 16, className: "text-green-600" });
    case 'in-progress': return Clock({ size: 16, className: "text-blue-600" });
    case 'overdue': return AlertTriangle({ size: 16, className: "text-red-600" });
    default: return CalendarDays({ size: 16, className: "text-yellow-600" });
  }
};
