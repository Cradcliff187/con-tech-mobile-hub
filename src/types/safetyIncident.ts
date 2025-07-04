export interface SafetyIncident {
  id: string;
  project_id: string;
  incident_date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'open' | 'investigating' | 'closed';
  reported_by?: string;
  corrective_actions?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    name: string;
  };
  reporter?: {
    full_name?: string;
    email: string;
  };
}

export interface SafetyIncidentPhoto {
  id: string;
  safety_incident_id: string;
  document_id: string;
  uploaded_at: string;
  alt_text?: string;
  display_order: number;
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

export interface CreateSafetyIncidentData {
  project_id: string;
  incident_date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  corrective_actions?: string;
}

export interface UpdateSafetyIncidentData extends Partial<CreateSafetyIncidentData> {
  status?: 'open' | 'investigating' | 'closed';
}