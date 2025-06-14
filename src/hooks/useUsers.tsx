
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userApi } from '@/services/userApi';
import { UserProfile, UserInvitation, CreateExternalUserData } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const userData = await userApi.fetchUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await userApi.updateUserRole(userId, role);
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
      await userApi.updateUserStatus(userId, status);
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
      await userApi.deleteUser(userId);
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
      await fetchUsers();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    users,
    loading,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refetch: fetchUsers
  };
};
