-- Fix missing profile creation trigger that prevents admin notifications
-- This addresses the root cause: auth.users trigger missing

-- Recreate the missing trigger on auth.users table that creates profiles
-- This trigger calls handle_new_user() function when new users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Clean up the existing broken user record and recreate the profile
-- This will ensure chris.l.radcliff@gmail.com gets a proper profile
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