
import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
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
  const lastCheckedUserRef = useRef<string | null>(null);
  const isCheckingRef = useRef(false);

  const checkAdminStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }

    if (!user || !profile) {
      console.log('No user or profile, not admin');
      setIsAdmin(false);
      setLoading(false);
      lastCheckedUserRef.current = null;
      return;
    }

    // Skip if we've already checked this user and they haven't changed
    if (lastCheckedUserRef.current === user.id) {
      setLoading(false);
      return;
    }

    // Only check if account is approved
    if (profile.account_status !== 'approved') {
      console.log('Account not approved, not admin');
      setIsAdmin(false);
      setLoading(false);
      lastCheckedUserRef.current = user.id;
      return;
    }

    isCheckingRef.current = true;
    
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
      
      lastCheckedUserRef.current = user.id;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      lastCheckedUserRef.current = user.id;
    } finally {
      isCheckingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run when user ID or account status changes, not on every user/profile object change
    const currentUserId = user?.id || null;
    const currentAccountStatus = profile?.account_status || null;
    
    // Reset state when user changes
    if (lastCheckedUserRef.current !== currentUserId) {
      setLoading(true);
      setIsAdmin(false);
    }
    
    // Use a small debounce to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      checkAdminStatus();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, profile?.account_status]); // Only depend on specific values that matter

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCheckingRef.current = false;
    };
  }, []);

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
