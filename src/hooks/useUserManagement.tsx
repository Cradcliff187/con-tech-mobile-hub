
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as UserProfile[] || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_invitations');

      if (error) {
        console.error('Error fetching invitations:', error);
        setInvitations([]);
        return;
      }
      setInvitations(data as UserInvitation[] || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const createExternalUser = async (userData: {
    email: string;
    role: string;
    project_id?: string;
    full_name?: string;
  }) => {
    try {
      // Create the user account with temporary password
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

      toast({
        title: "Success",
        description: `External user ${userData.email} created successfully. Temporary password: ${tempPassword}`,
      });

      await fetchUsers();
      await fetchInvitations();
      
      return { data: authData, error: null, tempPassword };
    } catch (error: any) {
      console.error('Error creating external user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create external user",
        variant: "destructive"
      });
      return { data: null, error, tempPassword: null };
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role as any })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
      return { error };
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status } as any)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User status updated successfully"
      });

      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete from auth (this will cascade to profiles due to RLS)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchInvitations()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    users,
    invitations,
    loading,
    createExternalUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refetch: () => Promise.all([fetchUsers(), fetchInvitations()])
  };
};
