
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/auth';

export const authApi = {
  async fetchProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_company_user, auto_approved, account_status, invited_by, last_login, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_company_user: data.is_company_user || false,
        auto_approved: data.auto_approved || false,
        account_status: data.account_status || 'pending',
        invited_by: data.invited_by,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateLastLogin(userId: string) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() } as any)
      .eq('id', userId);
  },

  async signUp(email: string, password: string, fullName?: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};
