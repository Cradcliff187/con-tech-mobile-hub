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
