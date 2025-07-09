
-- Fix admin notification issues and improve debugging
-- Enable pg_net extension for HTTP requests from database functions
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configure service role key for use in triggers
-- Note: This will need to be set manually via Supabase dashboard
-- We'll update the trigger to handle missing key gracefully

-- Enhanced auto_approve_company_users function with better error handling and debugging
CREATE OR REPLACE FUNCTION auto_approve_company_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        -- Try to get service role key from database settings
        SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
        
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
$$;

-- Create a helper function to test the admin notification system
CREATE OR REPLACE FUNCTION test_admin_notification(test_email text, test_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_response jsonb;
  service_role_key text;
BEGIN
  -- Get service role key
  SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
  
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
