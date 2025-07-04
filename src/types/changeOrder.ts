export interface ChangeOrder {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  cost_impact?: number;
  schedule_impact_days?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  reason_for_change?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    name: string;
  };
  requester?: {
    full_name?: string;
    email: string;
  };
  approver?: {
    full_name?: string;
    email: string;
  };
}

export interface ChangeOrderDocument {
  id: string;
  change_order_id: string;
  document_id: string;
  relationship_type: string;
  uploaded_at: string;
  document?: {
    id: string;
    name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    category?: string;
    created_at: string;
  };
}

export interface CreateChangeOrderData {
  title: string;
  description?: string;
  project_id: string;
  cost_impact?: number;
  schedule_impact_days?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason_for_change?: string;
}

export interface UpdateChangeOrderData extends Partial<CreateChangeOrderData> {
  status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  approved_by?: string;
}