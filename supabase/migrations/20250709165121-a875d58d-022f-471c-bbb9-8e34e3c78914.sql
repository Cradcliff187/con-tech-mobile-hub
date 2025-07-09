
-- Configure service role key for admin notifications
-- This allows the auto_approve_company_users trigger to send notifications

-- Insert or update the service role key setting
INSERT INTO public.company_settings (setting_key, setting_value, description)
VALUES (
  'service_role_key',
  '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbWVkbGlsa3htcmJhY29pdGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkzMDA2MiwiZXhwIjoyMDY1NTA2MDYyfQ.S_C2gTRJNrN_oLSSg-yDdKti1kbyDoW6TB4rbU_rl6s"',
  'Service role key for admin notifications and system operations'
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Update the auto_approve_company_users function to use company_settings
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
        -- Get service role key from company_settings
        SELECT (setting_value #>> '{}')::text INTO service_role_key
        FROM public.company_settings 
        WHERE setting_key = 'service_role_key';
        
        -- Log attempt for debugging
        RAISE NOTICE 'Attempting to send admin notification for user: %, service_key_present: %', 
          NEW.email, 
          CASE WHEN service_role_key IS NOT NULL AND length(service_role_key) > 0 THEN 'YES' ELSE 'NO' END;
        
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
