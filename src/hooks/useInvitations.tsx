
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userApi } from '@/services/userApi';
import { UserInvitation, CreateExternalUserData } from '@/types/user';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const invitationData = await userApi.fetchInvitations();
      setInvitations(invitationData);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const createExternalUser = async (userData: CreateExternalUserData) => {
    try {
      const result = await userApi.createExternalUser(userData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to create external user",
          variant: "destructive"
        });
        return result;
      }

      toast({
        title: "Success",
        description: `External user ${userData.email} created successfully. Temporary password: ${result.tempPassword}`,
      });

      await fetchInvitations();
      return result;
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchInvitations();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    invitations,
    loading,
    createExternalUser,
    refetch: fetchInvitations
  };
};
