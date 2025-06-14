
-- Add domain validation and user management columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_company_user BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'suspended', 'inactive'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update the user_role enum to include all required roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'stakeholder';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vendor';

-- Function to check if email is from company domain
CREATE OR REPLACE FUNCTION is_company_domain(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ILIKE '%@austinkunzconstruction.com';
END;
$$;

-- Function to auto-approve company users during signup
CREATE OR REPLACE FUNCTION auto_approve_company_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-approve company users
DROP TRIGGER IF EXISTS auto_approve_company_users_trigger ON profiles;
CREATE TRIGGER auto_approve_company_users_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_company_users();

-- Update existing profiles to set company user status
UPDATE profiles 
SET 
  is_company_user = is_company_domain(email),
  auto_approved = is_company_domain(email),
  account_status = CASE 
    WHEN is_company_domain(email) THEN 'approved'
    ELSE 'pending'
  END
WHERE is_company_user IS NULL OR auto_approved IS NULL;

-- Create user invitations table for external stakeholder management
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'stakeholder',
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email, project_id)
);

-- Enable RLS on user_invitations
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_invitations
CREATE POLICY "Company users can view invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

CREATE POLICY "Company users can create invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
      AND profiles.role IN ('admin', 'project_manager')
    )
  );

-- Function to get user invitations with proper typing
CREATE OR REPLACE FUNCTION get_user_invitations()
RETURNS TABLE(
  id UUID,
  email TEXT,
  role user_role,
  invited_by UUID,
  project_id UUID,
  invitation_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.invited_by,
    ui.project_id,
    ui.invitation_token,
    ui.expires_at,
    ui.accepted_at,
    ui.created_at
  FROM user_invitations ui
  WHERE EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_company_user = true 
    AND profiles.account_status = 'approved'
  );
$$;

-- Function to check user permissions based on role and company status
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  is_company BOOLEAN;
  account_approved BOOLEAN;
BEGIN
  SELECT role, is_company_user, (account_status = 'approved')
  INTO user_role, is_company, account_approved
  FROM profiles
  WHERE id = user_id;
  
  -- User must be approved to have any permissions
  IF NOT account_approved THEN
    RETURN false;
  END IF;
  
  -- Company users have broader permissions
  IF is_company THEN
    CASE required_permission
      WHEN 'admin_access' THEN RETURN user_role = 'admin';
      WHEN 'manage_projects' THEN RETURN user_role IN ('admin', 'project_manager');
      WHEN 'manage_stakeholders' THEN RETURN user_role IN ('admin', 'project_manager');
      WHEN 'supervise_tasks' THEN RETURN user_role IN ('admin', 'project_manager', 'site_supervisor');
      WHEN 'update_tasks' THEN RETURN user_role IN ('admin', 'project_manager', 'site_supervisor', 'worker');
      WHEN 'view_projects' THEN RETURN true; -- All company users can view projects
      ELSE RETURN false;
    END CASE;
  ELSE
    -- External users have limited permissions
    CASE required_permission
      WHEN 'view_assigned_tasks' THEN RETURN user_role IN ('stakeholder', 'client', 'vendor');
      WHEN 'update_assigned_tasks' THEN RETURN user_role = 'stakeholder';
      WHEN 'view_project_progress' THEN RETURN user_role = 'client';
      WHEN 'update_deliveries' THEN RETURN user_role = 'vendor';
      ELSE RETURN false;
    END CASE;
  END IF;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_company_user ON profiles(is_company_user);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
