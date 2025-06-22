
import { Stakeholder } from '../useStakeholders';

export interface StakeholderAssignment {
  id: string;
  stakeholder_id: string;
  project_id?: string;
  task_id?: string;
  equipment_id?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Enhanced tracking fields
  total_hours: number;
  total_cost: number;
  week_start_date?: string;
  daily_hours: Record<string, number>;
  stakeholder?: Stakeholder;
}

export interface CreateAssignmentData extends Omit<StakeholderAssignment, 'id' | 'created_at' | 'updated_at' | 'stakeholder' | 'total_hours' | 'total_cost' | 'daily_hours'> {}
