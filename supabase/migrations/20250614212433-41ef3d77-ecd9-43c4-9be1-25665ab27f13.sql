
-- Fix the mutable search_path security warning for the update_updated_at_column function
-- Use CREATE OR REPLACE instead of DROP to avoid dependency issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Verify the function was updated successfully
SELECT 
  p.proname as function_name,
  p.prosecdef as security_definer,
  p.proconfig as config_settings
FROM pg_proc p
WHERE p.proname = 'update_updated_at_column';
