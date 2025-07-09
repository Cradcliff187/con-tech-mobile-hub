-- Fix the service role key storage issue
-- Remove the extra quotes from the JSON value in company_settings
UPDATE public.company_settings 
SET setting_value = '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbWVkbGlsa3htcmJhY29pdGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkzMDA2MiwiZXhwIjoyMDY1NTA2MDYyfQ.S_C2gTRJNrN_oLSSg-yDdKti1kbyDoW6TB4rbU_rl6s"'::jsonb
WHERE setting_key = 'service_role_key';

-- Update the auto_approve_company_users function to properly extract the service role key
CREATE OR REPLACE FUNCTION public.auto_approve_company_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_response jsonb;
  service_role_key text;
  error_message text;
BEGIN
  -- Check if this is a company domain user
  IF is_company_domain(NEW.email) THEN
    NEW.is_company_user := true;
    NEW.auto_approved := true;
    NEW.account_status := 'approved';
    -- Set default role for company users
    IF NEW.role IS NULL THEN
      NEW.role := 'project_manager';
    END IF;
  ELSE
    -- External users need manual approval
    NEW.is_company_user := false;
    NEW.auto_approved := false;
    NEW.account_status := 'pending';
    -- Default role for external users
    IF NEW.role IS NULL THEN
      NEW.role := 'stakeholder';
    END IF;
    
    -- Send admin notification for external user signup
    -- Only on INSERT operations (new signups)
    IF TG_OP = 'INSERT' THEN
      BEGIN
        -- Get service role key from company_settings (handle both string and object formats)
        SELECT 
          CASE 
            WHEN jsonb_typeof(setting_value) = 'string' THEN setting_value #>> '{}'
            ELSE setting_value #>> '{}'
          END INTO service_role_key
        FROM public.company_settings 
        WHERE setting_key = 'service_role_key';
        
        -- Log attempt for debugging
        RAISE NOTICE 'Attempting to send admin notification for user: %, service_key_present: %, key_length: %', 
          NEW.email, 
          CASE WHEN service_role_key IS NOT NULL AND length(service_role_key) > 0 THEN 'YES' ELSE 'NO' END,
          COALESCE(length(service_role_key), 0);
        
        IF service_role_key IS NULL OR length(service_role_key) = 0 THEN
          RAISE NOTICE 'Service role key not configured - admin notification skipped for %', NEW.email;
        ELSE
          -- Attempt to send notification
          SELECT INTO notification_response
            net.http_post(
              url := 'https://jjmedlilkxmrbacoitio.supabase.co/functions/v1/send-admin-notification',
              headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
              ),
              body := jsonb_build_object(
                'userEmail', NEW.email,
                'userName', COALESCE(NEW.full_name, NEW.email),
                'userRole', NEW.role::text,
                'createdBy', 'User Signup'
              )
            );
          
          -- Log the response for debugging
          RAISE NOTICE 'Admin notification response for %: %', NEW.email, notification_response;
        END IF;
        
      EXCEPTION WHEN OTHERS THEN
        -- Capture and log the specific error
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RAISE NOTICE 'Admin notification failed for %: %', NEW.email, error_message;
        
        -- Don't fail the user creation if notification fails
        NULL;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists on the profiles table
DROP TRIGGER IF EXISTS profiles_auto_approve_trigger ON public.profiles;
CREATE TRIGGER profiles_auto_approve_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_company_users();