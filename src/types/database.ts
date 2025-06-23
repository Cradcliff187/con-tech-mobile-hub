
export interface StructuredAddress {
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

// New unified lifecycle status type
export type LifecycleStatus = 
  | 'pre_planning'
  | 'planning_active' 
  | 'construction_active'
  | 'construction_hold'
  | 'punch_list_phase'
  | 'project_closeout'
  | 'project_completed'
  | 'project_cancelled';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  phase: 'planning' | 'active' | 'punch_list' | 'closeout' | 'completed';
  lifecycle_status?: LifecycleStatus; // Legacy unified status field
  unified_lifecycle_status?: 'pre_construction' | 'mobilization' | 'construction' | 'punch_list' | 'final_inspection' | 'closeout' | 'warranty' | 'on_hold' | 'cancelled'; // New unified status field
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  progress: number;
  location?: string;
  project_manager_id?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
  // Structured address fields
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  client?: {
    id: string;
    company_name?: string;
    contact_person?: string;
    stakeholder_type: string;
  };
}

export interface Stakeholder {
  id: string;
  stakeholder_type: 'client' | 'vendor' | 'subcontractor' | 'employee';
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  specialties?: string[];
  license_number?: string;
  insurance_expiry?: string;
  rating?: number | null;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  account_status?: 'active' | 'inactive' | 'pending';
  role?: string;
  crew_size?: number;
  notes?: string;
  profile_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  start_date?: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  assignee_id?: string;
  assigned_stakeholder_id?: string;
  task_type?: 'regular' | 'punch_list';
  required_skills?: string[];
  punch_list_category?: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other';
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number;
  created_by?: string;
  matches_skills?: boolean;
  converted_from_task_id?: string;
  inspection_status?: 'pending' | 'passed' | 'failed' | 'na';
}

export interface ResourceAllocation {
  id: string;
  project_id: string;
  team_name: string;
  week_start_date: string;
  total_budget: number;
  total_used: number;
  created_at: string;
  updated_at: string;
  allocation_type?: 'weekly' | 'daily';
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  allocation_id: string;
  user_id?: string;
  name: string;
  role: string;
  hours_allocated: number;
  hours_used: number;
  cost_per_hour: number;
  availability: number;
  date?: string;
  tasks?: string[];
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_company_user: boolean;
  account_status: string;
  skills?: string[];
}
