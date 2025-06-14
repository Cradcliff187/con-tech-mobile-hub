
import { User, Session } from '@supabase/supabase-js';

export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_company_user?: boolean;
  auto_approved?: boolean;
  account_status?: string;
  invited_by?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
