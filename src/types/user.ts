
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_company_user: boolean;
  auto_approved: boolean;
  account_status: string;
  invited_by: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  project_id: string | null;
  invitation_token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface CreateExternalUserData {
  email: string;
  role: string;
  project_id?: string;
  full_name?: string;
}

export interface CreateUserResult {
  data: any;
  error: any;
  tempPassword: string | null;
}
