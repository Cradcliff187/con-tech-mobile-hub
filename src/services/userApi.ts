
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
    const { data, error } = await supabase.functions.invoke('admin-get-all-users');

    if (error) {
      console.error("Error invoking admin-get-all-users function:", error);
      throw error;
    }
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase.functions.invoke('admin-update-user', {
      body: { userId, updates: { role: role as UserRole } },
    });
    if (error) throw error;
    return { error: null };
  },

  async updateUserStatus(userId: string, status: string) {
    const { error } = await supabase.functions.invoke('admin-update-user', {
      body: { userId, updates: { account_status: status } },
    });
    if (error) throw error;
    return { error: null };
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId },
    });
    if (error) throw error;
    return { error: null };
  },

  async createExternalUser(userData: CreateExternalUserData): Promise<CreateUserResult> {
    try {
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
      
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: userData.email,
          password: tempPassword,
          metadata: {
            full_name: userData.full_name || userData.email.split('@')[0],
            role: userData.role,
          },
        },
      });

      if (error) {
        throw error;
      }
      
      return { data, error: null, tempPassword };
    } catch (error: any) {
      console.error('Error creating external user:', error);
      const message = error.context?.message || error.message || "Failed to create external user";
      return { data: null, error: { message }, tempPassword: null };
    }
  },

  async fetchInvitations() {
    const { data, error } = await supabase.rpc('get_user_invitations');
    if (error) throw error;
    return data || [];
  }
};
