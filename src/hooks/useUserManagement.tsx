
import { useUsers } from './useUsers';
import { useInvitations } from './useInvitations';

export const useUserManagement = () => {
  const usersHook = useUsers();
  const invitationsHook = useInvitations();

  return {
    users: usersHook.users,
    invitations: invitationsHook.invitations,
    loading: usersHook.loading || invitationsHook.loading,
    createExternalUser: invitationsHook.createExternalUser,
    updateUserRole: usersHook.updateUserRole,
    updateUserStatus: usersHook.updateUserStatus,
    deleteUser: usersHook.deleteUser,
    refetch: () => Promise.all([usersHook.refetch(), invitationsHook.refetch()])
  };
};

// Export types for backward compatibility
export type { UserProfile, UserInvitation } from '@/types/user';
