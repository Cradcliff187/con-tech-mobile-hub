
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
    
    try {
      // Service Role Key Configuration Note:
      // The admin-update-user Edge Function requires the SUPABASE_SERVICE_ROLE_KEY 
      // to be configured in the Edge Function environment variables.
      // This key allows the function to bypass RLS policies when updating user profiles.
      // The key should NEVER be stored in the database or client-side code.
      
      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: { 
          userId, 
          updates: { account_status: status },
          operation: 'update_status'
        },
      });
      
      console.log('✅ [userApi] Edge Function response:', { data, error });
      
      if (error) {
        console.error('❌ [userApi] Edge Function error:', error);
        
        // Handle specific error types for better user feedback
        if (error.message?.includes('Forbidden') || error.message?.includes('403')) {
          throw new Error('Access denied: You need admin privileges to update user status');
        } else if (error.message?.includes('service_role_key')) {
          throw new Error('System configuration error: Admin service not properly configured');
        } else if (error.message?.includes('User not found')) {
          throw new Error('User not found: The specified user may have been deleted');
        } else if (error.message?.includes('Network')) {
          throw new Error('Network error: Please check your connection and try again');
        }
        
        // Generic error fallback
        const errorMessage = error.message || 'Edge Function failed to execute';
        throw new Error(`Failed to update user status: ${errorMessage}`);
      }
      
      if (data?.error) {
        console.error('❌ [userApi] Server error from Edge Function:', data.error);
        const serverErrorMessage = typeof data.error === 'string' ? data.error : data.error.message || 'Unknown server error';
        throw new Error(`Server error: ${serverErrorMessage}`);
      }
      
      if (!data?.success && data?.success !== undefined) {
        console.error('❌ [userApi] Edge Function returned failure:', data);
        throw new Error('Update operation failed on server');
      }
      
      console.log('✅ [userApi] User status updated successfully');
      return { data: data?.data || data, error: null };
      
    } catch (error: any) {
      console.error('❌ [userApi] updateUserStatus failed:', error);
      
      // Create a structured error with helpful context for debugging
      const structuredError = {
        message: error.message || 'Failed to update user status',
        context: {
          userId,
          status,
          timestamp: new Date().toISOString(),
          originalError: error
        }
      };
      
      throw structuredError;
    }
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
