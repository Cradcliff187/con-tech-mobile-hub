
import { StakeholderAssignment } from '../stakeholders/types';
import { Stakeholder } from '../useStakeholders';
import { Project } from '@/types/database';

export interface EmployeeAssignment extends StakeholderAssignment {
  stakeholder: Stakeholder & { stakeholder_type: 'employee' };
  project?: Project;
  utilization_percentage?: number;
}

export interface UtilizationMetrics {
  total_hours: number;
  total_projects: number;
  weekly_capacity: number;
  utilization_rate: number;
  is_over_allocated: boolean;
}

export interface EmployeeCosts {
  project_id: string;
  project_name?: string;
  total_labor_cost: number;
  employee_count: number;
  avg_hourly_rate: number;
  total_hours: number;
}

export interface CreateEmployeeAssignmentData {
  stakeholder_id: string;
  project_id: string;
  role?: string;
  hourly_rate?: number;
  start_date?: string;
  end_date?: string;
  total_hours?: number;
  status?: string;
  notes?: string;
}
