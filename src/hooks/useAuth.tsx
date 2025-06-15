
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/authApi';
import { getAuthNotification, getSignupNotification } from '@/utils/authNotifications';
import { AuthContextType, ProfileData } from '@/types/auth';

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

  const handleAuthStateChange = async (session: Session | null) => {
    console.log('Auth state changed:', session?.user?.email || 'no user');
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      // Use setTimeout to prevent blocking auth state change
      setTimeout(async () => {
        try {
          const profileData = await authApi.fetchProfile(session.user.id);
          console.log('Profile data loaded:', profileData);
          setProfile(profileData);
          
          if (profileData) {
            await authApi.updateLastLogin(session.user.id);

            const notification = getAuthNotification(profileData, false);
            if (notification) {
              toast(notification);
            }

            // Handle account status - only sign out for suspended/inactive
            if (profileData.account_status === 'suspended' || profileData.account_status === 'inactive') {
              console.log('Account suspended/inactive, signing out');
              await supabase.auth.signOut();
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Profile Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive"
          });
        }
      }, 0);
    } else {
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Attempting signup for:', email);
      const { error } = await authApi.signUp(email, password, fullName);

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Signup successful');
        const notification = getSignupNotification(email);
        toast(notification);
      }

      return { error };
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin for:', email);
      const { error } = await authApi.signIn(email, password);

      if (error) {
        console.error('Signin error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Signin successful');
      }

      return { error };
    } catch (error: any) {
      console.error('Signin exception:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      const { error } = await authApi.signOut();
      if (error) {
        console.error('Signout error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Signout successful');
        setProfile(null);
        setUser(null);
        setSession(null);
      }
    } catch (error: any) {
      console.error('Signout exception:', error);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        await handleAuthStateChange(session);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'no user');
      handleAuthStateChange(session);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

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
