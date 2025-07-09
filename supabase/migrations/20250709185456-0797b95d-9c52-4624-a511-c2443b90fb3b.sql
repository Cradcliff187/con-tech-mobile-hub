-- Fix missing profile creation trigger and broken test function
-- This addresses the root cause: auth.users trigger missing and test function using wrong key source

-- Recreate the missing trigger on auth.users table that creates profiles
-- This trigger calls handle_new_user() function when new users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Fix the test_admin_notification function to use company_settings like the real function
CREATE OR REPLACE FUNCTION test_admin_notification(test_email text, test_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_response jsonb;
  service_role_key text;
BEGIN
  -- Get service role key from company_settings (same as real function)
  SELECT 
    CASE 
      WHEN jsonb_typeof(setting_value) = 'string' THEN setting_value #>> '{}'
      ELSE setting_value #>> '{}'
    END INTO service_role_key
  FROM public.company_settings 
  WHERE setting_key = 'service_role_key';
  
  IF service_role_key IS NULL OR length(service_role_key) = 0 THEN
    RETURN jsonb_build_object('error', 'Service role key not configured');
  END IF;
  
  -- Test the notification
  SELECT INTO notification_response
    net.http_post(
      url := 'https://jjmedlilkxmrbacoitio.supabase.co/functions/v1/send-admin-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'userEmail', test_email,
        'userName', test_name,
        'userRole', 'stakeholder',
        'createdBy', 'Manual Test'
      )
    );
  
  RETURN notification_response;
END;
$$;

-- Create the missing profile for chris.l.radcliff@gmail.com
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the auth user record
  SELECT id, email, raw_user_meta_data 
  INTO user_record
  FROM auth.users 
  WHERE email = 'chris.l.radcliff@gmail.com';
  
  IF FOUND THEN
    -- Create the missing profile record
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.email)
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created missing profile for user: %', user_record.email;
  END IF;
END $$;