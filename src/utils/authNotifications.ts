
import { ProfileData } from '@/types/auth';

export const getAuthNotification = (profile: ProfileData, isCompanyEmail: boolean) => {
  switch (profile.account_status) {
    case 'pending':
      return {
        title: "Account Pending Approval",
        description: "Your account is awaiting approval from an administrator. You'll receive an email when approved.",
        variant: "destructive" as const
      };
    case 'suspended':
      return {
        title: "Account Suspended",
        description: "Your account has been suspended. Please contact an administrator.",
        variant: "destructive" as const
      };
    case 'inactive':
      return {
        title: "Account Inactive",
        description: "Your account is inactive. Please contact an administrator.",
        variant: "destructive" as const
      };
    case 'approved':
      if (profile.is_company_user) {
        return {
          title: "Welcome back!",
          description: `Welcome to ConstructPro, ${profile.full_name || 'team member'}!`,
          variant: "default" as const
        };
      }
      break;
  }
  return null;
};

export const getSignupNotification = (email: string) => {
  const isCompanyEmail = email.toLowerCase().includes('@austinkunzconstruction.com');
  
  if (isCompanyEmail) {
    return {
      title: "Welcome to ConstructPro!",
      description: "Your company account has been created and approved. Please check your email to verify your account.",
      variant: "default" as const
    };
  } else {
    return {
      title: "Account Created",
      description: "Your account has been created but requires approval from an administrator. You'll receive an email when approved.",
      variant: "destructive" as const
    };
  }
};
