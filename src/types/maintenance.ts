
export interface MaintenanceTask {
  id: string;
  equipment_id: string;
  title: string;
  description?: string;
  task_type: 'routine' | 'repair' | 'inspection' | 'calibration' | 'safety_check';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  scheduled_date: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to_stakeholder_id?: string;
  assigned_to_user_id?: string;
  created_by?: string;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  checklist_items: any[];
  created_at: string;
  updated_at: string;
  // Relations
  equipment?: {
    id: string;
    name: string;
    type?: string;
  };
  assigned_stakeholder?: {
    id: string;
    contact_person?: string;
    company_name?: string;
  };
  assigned_user?: {
    id: string;
    full_name?: string;
  };
}

export interface CreateMaintenanceTaskData {
  equipment_id: string;
  title: string;
  description?: string;
  task_type?: string;
  priority?: string;
  scheduled_date: string;
  estimated_hours?: number;
  assigned_to_stakeholder_id?: string;
  assigned_to_user_id?: string;
  notes?: string;
}
