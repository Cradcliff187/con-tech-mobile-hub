
export interface StakeholderAssignment {
  id: string;
  stakeholder_id: string;
  project_id?: string;
  task_id?: string;
  equipment_id?: string;
  role?: string;
  hourly_rate?: number;
  total_hours: number;
  total_cost: number;
  start_date?: string;
  end_date?: string;
  week_start_date?: string;
  status: 'assigned' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  notes?: string;
  daily_hours: Record<string, number>;
  created_at: string;
  updated_at: string;
  stakeholder?: {
    id: string;
    stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
    contact_person: string;
    company_name?: string;
    email?: string;
    phone?: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
  };
}

export interface CreateAssignmentData {
  stakeholder_id: string;
  project_id?: string;
  task_id?: string;
  equipment_id?: string;
  role?: string;
  hourly_rate?: number;
  total_hours?: number;
  start_date?: string;
  end_date?: string;
  week_start_date?: string;
  status?: 'assigned' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  notes?: string;
  daily_hours?: Record<string, number>;
}
