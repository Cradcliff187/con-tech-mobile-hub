
-- Drop existing restrictive RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any user profile" ON public.profiles;

-- Create new comprehensive RLS policies for profiles table
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid());

-- Allow admins to view all profiles (needed for user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (is_admin());

-- Allow admins to update any profile (needed for user approval/management)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE 
  USING (is_admin()) 
  WITH CHECK (is_admin());

-- Allow admins to insert profiles (for creating users)
CREATE POLICY "Admins can create profiles" ON public.profiles
  FOR INSERT 
  WITH CHECK (is_admin());
