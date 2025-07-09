
-- Remove the problematic RLS policy that conflicts with service role updates
DROP POLICY IF EXISTS "Admins can update any user profile" ON public.profiles;
