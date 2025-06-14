
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_company_user?: boolean;
  auto_approved?: boolean;
  account_status?: string;
  invited_by?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string): Promise<ProfileData | null> => {
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

      // Map the data to ensure proper typing
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
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile to check account status
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            
            if (profileData) {
              // Update last login
              await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);

              // Check account status
              if (profileData.account_status === 'pending') {
                toast({
                  title: "Account Pending Approval",
                  description: "Your account is awaiting approval from an administrator. You'll receive an email when approved.",
                  variant: "destructive"
                });
              } else if (profileData.account_status === 'suspended') {
                toast({
                  title: "Account Suspended",
                  description: "Your account has been suspended. Please contact an administrator.",
                  variant: "destructive"
                });
                await supabase.auth.signOut();
              } else if (profileData.account_status === 'inactive') {
                toast({
                  title: "Account Inactive",
                  description: "Your account is inactive. Please contact an administrator.",
                  variant: "destructive"
                });
                await supabase.auth.signOut();
              } else if (profileData.is_company_user && profileData.account_status === 'approved') {
                toast({
                  title: "Welcome back!",
                  description: `Welcome to ConstructPro, ${profileData.full_name || 'team member'}!`
                });
              }
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Check if email is from company domain
    const isCompanyEmail = email.toLowerCase().includes('@austinkunzconstruction.com');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      if (isCompanyEmail) {
        toast({
          title: "Welcome to ConstructPro!",
          description: "Your company account has been created and approved. Please check your email to verify your account."
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your account has been created but requires approval from an administrator. You'll receive an email when approved.",
          variant: "destructive"
        });
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
