export interface EquipmentServiceRecord {
  id: string;
  equipment_id: string;
  document_id: string;
  service_date: string;
  service_type: string;
  notes?: string;
  uploaded_at: string;
  document?: {
    id: string;
    name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    created_at: string;
  };
}

export interface CreateServiceRecordData {
  equipment_id: string;
  document_id: string;
  service_date: string;
  service_type: 'routine' | 'repair' | 'inspection' | 'warranty';
  notes?: string;
}

export interface ServiceRecordWithDocument extends EquipmentServiceRecord {
  document: {
    id: string;
    name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    created_at: string;
  };
}