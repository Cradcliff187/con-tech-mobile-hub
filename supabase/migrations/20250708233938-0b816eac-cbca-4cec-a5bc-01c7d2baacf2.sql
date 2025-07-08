-- Modify the auto_approve_company_users function to send admin notifications for external users
CREATE OR REPLACE FUNCTION auto_approve_company_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_response jsonb;
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
        SELECT INTO notification_response
          net.http_post(
            url := 'https://jjmedlilkxmrbacoitio.supabase.co/functions/v1/send-admin-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
              'userEmail', NEW.email,
              'userName', COALESCE(NEW.full_name, NEW.email),
              'userRole', NEW.role::text,
              'createdBy', 'User Signup'
            )
          );
          
        -- Log the notification attempt (optional)
        INSERT INTO public.activity_log (
          action,
          entity_type,
          entity_id,
          user_id,
          details
        ) VALUES (
          'admin_notification_sent',
          'profile',
          NEW.id,
          NEW.id,
          jsonb_build_object(
            'email', NEW.email,
            'notification_response', notification_response
          )
        );
        
      EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        INSERT INTO public.activity_log (
          action,
          entity_type,
          entity_id,
          user_id,
          details
        ) VALUES (
          'admin_notification_failed',
          'profile',
          NEW.id,
          NEW.id,
          jsonb_build_object(
            'email', NEW.email,
            'error', SQLERRM
          )
        );
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;