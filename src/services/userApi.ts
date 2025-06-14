
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserInvitation, CreateExternalUserData, CreateUserResult } from '@/types/user';

export const userApi = {
  async fetchUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_company_user, auto_approved, account_status, invited_by, last_login, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'worker',
      is_company_user: user.is_company_user || false,
      auto_approved: user.auto_approved || false,
      account_status: user.account_status || 'pending',
      invited_by: user.invited_by,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  },

  async fetchInvitations(): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_invitations');

      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }
      return (data || []) as UserInvitation[];
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  },

  async createExternalUser(userData: CreateExternalUserData): Promise<CreateUserResult> {
    try {
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name || userData.email.split('@')[0],
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          role: userData.role
        }
      });

      if (authError) throw authError;
      
      return { data: authData, error: null, tempPassword };
    } catch (error: any) {
      console.error('Error creating external user:', error);
      return { data: null, error, tempPassword: null };
    }
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role } as any)
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  },

  async updateUserStatus(userId: string, status: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: status } as any)
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return { error: null };
  }
};
