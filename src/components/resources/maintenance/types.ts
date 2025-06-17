
export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate: string;
  estimatedHours: number;
  assignedTo?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  description: string;
}
