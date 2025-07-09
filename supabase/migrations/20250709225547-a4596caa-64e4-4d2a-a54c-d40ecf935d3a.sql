
-- Add RLS policy to allow admins to update any user's profile
CREATE POLICY "Admins can update any user profile" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());
