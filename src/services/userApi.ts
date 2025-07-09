
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
    console.log('🔧 [userApi] updateUserRole called', { userId, role });
    
    const { data, error } = await supabase.functions.invoke('admin-update-user', {
      body: { userId, updates: { role: role as UserRole } },
    });
    
    console.log('🔧 [userApi] updateUserRole response:', { data, error });
    
    if (error) {
      console.error('❌ [userApi] updateUserRole failed:', error);
      throw error;
    }
    
    return { error: null };
  },

  async updateUserStatus(userId: string, status: string) {
    console.log('🔧 [userApi] updateUserStatus called', { userId, status });
    
    // Service Role Key Configuration Note:
    // The admin-update-user Edge Function requires the SUPABASE_SERVICE_ROLE_KEY 
    // to be configured in the Edge Function environment variables.
    // This key allows the function to bypass RLS policies when updating user profiles.
    // The key should NEVER be stored in the database or client-side code.
    
    const { data, error } = await supabase.functions.invoke('admin-update-user', {
      body: { userId, updates: { account_status: status } },
    });
    
    console.log('🔧 [userApi] updateUserStatus response:', { data, error });
    
    if (error) {
      console.error('❌ [userApi] updateUserStatus failed:', error);
      
      // Check for specific error types to provide better user feedback
      if (error.message?.includes('Forbidden')) {
        throw new Error('You do not have permission to update user status. Please ensure you are logged in as an admin.');
      } else if (error.message?.includes('service_role_key')) {
        throw new Error('System configuration error: Service role key not configured. Please contact your system administrator.');
      }
      
      throw error;
    }
    
    return { error: null };
  },

  async deleteUser(userId: string) {
    console.log('🗑️ [userApi] deleteUser called', { userId });
    
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId },
    });
    
    console.log('🗑️ [userApi] deleteUser response:', { data, error });
    
    if (error) {
      console.error('❌ [userApi] deleteUser failed:', error);
      throw error;
    }
    
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
