
import { useAuthSession } from '@/contexts/AuthSessionContext';

export const useProjectPermissions = () => {
  const { projectPermissions } = useAuthSession();
  
  return {
    canAccessProject: projectPermissions.canAccessProject,
    canAssignToProject: projectPermissions.canAssignToProject,
    loading: projectPermissions.loading,
    userProjects: projectPermissions.userProjects,
    sessionError: projectPermissions.sessionError
  };
};
