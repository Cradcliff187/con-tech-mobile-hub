
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type UserRole = Database['public']['Enums']['user_role'];

interface CreateExternalUserData {
  email: string;
  full_name?: string;
  role: string;
  project_id?: string;
}

interface CreateUserResult {
  data: any;
  error: any;
  tempPassword: string | null;
}

export const userApi = {
  async fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    const update: ProfileUpdate = { role: role as UserRole };
    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  },

  async updateUserStatus(userId: string, status: string) {
    const update: ProfileUpdate = { account_status: status };
    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return { error: null };
  },

  async createExternalUser(userData: CreateExternalUserData): Promise<CreateUserResult> {
    try {
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://jjmedlilkxmrbacoitio.supabase.co/functions/v1/admin-create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: userData.email,
          password: tempPassword,
          metadata: {
            full_name: userData.full_name || userData.email.split('@')[0],
            invited_by: (await supabase.auth.getUser()).data.user?.id,
            role: userData.role
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return { data: result.data, error: null, tempPassword };
    } catch (error: any) {
      console.error('Error creating external user:', error);
      return { data: null, error, tempPassword: null };
    }
  },

  async fetchInvitations() {
    const { data, error } = await supabase.rpc('get_user_invitations');
    if (error) throw error;
    return data || [];
  }
};
