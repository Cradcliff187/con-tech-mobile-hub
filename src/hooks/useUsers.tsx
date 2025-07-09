
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
    console.log('🔧 [useUsers] updateUserRole called', { userId, role });
    
    try {
      const result = await userApi.updateUserRole(userId, role);
      console.log('✅ [useUsers] updateUserRole API result:', result);
      
      toast({
        title: "Success",
        description: `User role updated to ${role} successfully`
      });
      
      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('❌ [useUsers] updateUserRole failed:', error);
      
      // Extract more detailed error information
      const errorMessage = error.context?.message || error.message || "Failed to update user role";
      console.error('❌ [useUsers] Detailed error:', { errorMessage, fullError: error });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: { message: errorMessage } };
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    console.log('🔧 [useUsers] updateUserStatus called', { userId, status });
    
    try {
      const result = await userApi.updateUserStatus(userId, status);
      console.log('✅ [useUsers] updateUserStatus API result:', result);
      
      // Show specific success message based on status change
      const statusMessages = {
        'approved': 'User has been approved and can now access the system',
        'pending': 'User status set to pending approval',
        'suspended': 'User access has been suspended',
        'inactive': 'User account has been deactivated'
      };
      
      toast({
        title: "Success",
        description: statusMessages[status as keyof typeof statusMessages] || `User status updated to ${status} successfully`
      });
      
      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('❌ [useUsers] updateUserStatus failed:', error);
      
      // Extract more detailed error information
      const errorMessage = error.context?.message || error.message || "Failed to update user status";
      console.error('❌ [useUsers] Detailed error:', { errorMessage, fullError: error });
      
      toast({
        title: "Error updating user status",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: { message: errorMessage } };
    }
  };

  const deleteUser = async (userId: string) => {
    console.log('🗑️ [useUsers] deleteUser called', { userId });
    
    try {
      const result = await userApi.deleteUser(userId);
      console.log('✅ [useUsers] deleteUser API result:', result);
      
      toast({
        title: "Success",
        description: "User account has been permanently deleted"
      });
      
      await fetchUsers();
      return { error: null };
    } catch (error: any) {
      console.error('❌ [useUsers] deleteUser failed:', error);
      
      // Extract more detailed error information
      const errorMessage = error.context?.message || error.message || "Failed to delete user";
      console.error('❌ [useUsers] Detailed error:', { errorMessage, fullError: error });
      
      toast({
        title: "Error deleting user",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: { message: errorMessage } };
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
