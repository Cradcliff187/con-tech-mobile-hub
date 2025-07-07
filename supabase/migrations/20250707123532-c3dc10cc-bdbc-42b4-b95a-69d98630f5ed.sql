-- ============================================================================
-- Fix Admin Access: Create missing is_admin() function and update RLS policies
-- This resolves "access denied" errors for admin users accessing CRM Goals settings
-- ============================================================================

-- Create the missing is_admin() function that RLS policies are calling
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  -- Return false immediately if no user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if current user has admin role and is approved company user
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_company_user = true
      AND account_status = 'approved'
  );
END;
$$;

-- Update is_approved_company_user() function to ensure consistency
CREATE OR REPLACE FUNCTION public.is_approved_company_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  -- Return false immediately if no user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if current user is approved company user
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_company_user = true
      AND account_status = 'approved'
  );
END;
$$;

-- Drop existing problematic policies on company_settings
DROP POLICY IF EXISTS "Admin users can manage company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Company users can view company settings" ON public.company_settings;

-- Recreate RLS policies for company_settings with proper function calls
CREATE POLICY "Admin users can manage company settings" 
ON public.company_settings 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Company users can view company settings" 
ON public.company_settings 
FOR SELECT 
USING (public.is_approved_company_user());

-- Add comment for debugging
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current authenticated user has admin role, is company user, and is approved';
COMMENT ON FUNCTION public.is_approved_company_user() IS 'Returns true if current authenticated user is approved company user';

-- Test query to verify functions work (run manually to test)
-- SELECT 
--   auth.uid() as current_user_id,
--   public.is_admin() as is_admin_result,
--   public.is_approved_company_user() as is_approved_company_result;