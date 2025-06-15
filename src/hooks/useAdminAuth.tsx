
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const checkAdminStatus = async () => {
    if (!user || !profile) {
      console.log('No user or profile, not admin');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Only check if account is approved
    if (profile.account_status !== 'approved') {
      console.log('Account not approved, not admin');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.email);
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        const isAdminUser = !!data;
        console.log('Admin status result:', isAdminUser);
        setIsAdmin(isAdminUser);
      }
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user, profile]);

  return (
    <AdminAuthContext.Provider value={{
      isAdmin,
      loading,
      checkAdminStatus
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
