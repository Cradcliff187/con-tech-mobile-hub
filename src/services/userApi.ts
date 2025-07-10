
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

// Helper function to validate auth session before API calls
const validateAuthSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('🔐 [userApi] Auth session validation:', { 
    hasSession: !!session, 
    hasAccessToken: !!session?.access_token,
    userId: session?.user?.id,
    error 
  });
  
  if (error) {
    console.error('❌ [userApi] Auth session error:', error);
    throw new Error('Authentication session error. Please sign out and sign back in.');
  }
  
  if (!session || !session.access_token) {
    console.error('❌ [userApi] No valid session found');
    throw new Error('Authentication required. Please sign out and sign back in.');
  }
  
  // Check if token is expired (access tokens are typically valid for 1 hour)
  const tokenExp = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  
  if (tokenExp && tokenExp < now) {
    console.error('❌ [userApi] Token expired', { tokenExp, now });
    throw new Error('Session expired. Please sign out and sign back in.');
  }
  
  return session;
};

export const userApi = {
  async fetchUsers() {
    // Validate auth session before making the call
    await validateAuthSession();
    
    const { data, error } = await supabase.functions.invoke('admin-get-all-users');

    if (error) {
      console.error("Error invoking admin-get-all-users function:", error);
      throw error;
    }
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    console.log('🔧 [userApi] updateUserRole called', { userId, role });
    
    // Validate auth session before making the call
    await validateAuthSession();
    
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
      // Validate auth session before making the call
      const session = await validateAuthSession();
      console.log('🔐 [userApi] Auth validation passed, proceeding with API call');
      
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
        
        // Handle auth-specific errors first
        if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('unauthorized')) {
          throw new Error('Authentication failed. Please sign out and sign back in.');
        } else if (error.message?.includes('Forbidden') || error.message?.includes('403')) {
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
    
    // Validate auth session before making the call
    await validateAuthSession();
    
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
      // Validate auth session before making the call
      await validateAuthSession();
      
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
    // Validate auth session before making the call
    await validateAuthSession();
    
    const { data, error } = await supabase.rpc('get_user_invitations');
    if (error) throw error;
    return data || [];
  }
};
