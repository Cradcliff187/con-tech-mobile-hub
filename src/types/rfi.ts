export interface RFI {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string;
  assigned_to?: string;
  due_date?: string;
  response?: string;
  responded_by?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    name: string;
  };
  submitter?: {
    full_name?: string;
    email: string;
  };
  assignee?: {
    full_name?: string;
    email: string;
  };
  responder?: {
    full_name?: string;
    email: string;
  };
}

export interface RFIDocument {
  id: string;
  rfi_id: string;
  document_id: string;
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

export interface CreateRFIData {
  title: string;
  description?: string;
  project_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
}

export interface UpdateRFIData extends Partial<CreateRFIData> {
  status?: 'open' | 'pending' | 'closed';
  response?: string;
}