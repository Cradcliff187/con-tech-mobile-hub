
import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

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
  const checkingRef = useRef(false);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  // Debounce the trigger values to prevent rapid changes
  const debouncedUserId = useDebounce(user?.id, 300);
  const debouncedAccountStatus = useDebounce(profile?.account_status, 300);

  const checkAdminStatus = async () => {
    // Prevent concurrent checks
    if (checkingRef.current) {
      console.log('Admin check already in progress, skipping');
      return;
    }

    // Implement cooldown period (minimum 2 seconds between checks)
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) {
      console.log('Admin check cooldown active, skipping');
      return;
    }

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

    checkingRef.current = true;
    lastCheckRef.current = now;

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
    } finally {
      checkingRef.current = false;
      setLoading(false);
    }
  };

  // Use debounced values and only essential properties to prevent infinite loops
  useEffect(() => {
    // Clear any existing cooldown
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }

    // Add small delay to prevent rapid successive calls
    cooldownRef.current = setTimeout(() => {
      checkAdminStatus();
    }, 100);

    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, [debouncedUserId, debouncedAccountStatus]); // Only depend on debounced primitive values

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
      checkingRef.current = false;
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
