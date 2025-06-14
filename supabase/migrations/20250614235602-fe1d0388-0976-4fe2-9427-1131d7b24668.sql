
-- First, let's check what RLS policies currently exist on the tasks table
-- and remove any that might cause circular references

-- Drop any existing problematic policies on tasks table
DROP POLICY IF EXISTS "Users can view project tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create project tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update project tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete project tasks" ON public.tasks;

-- Create a security definer function to check if user has access to a project
-- This prevents circular references in RLS policies
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has permission to access this project
  -- This could be expanded to check project team membership, roles, etc.
  RETURN EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (
      p.project_manager_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now create simplified RLS policies for tasks that avoid circular references
CREATE POLICY "Authenticated users can view tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (public.user_can_access_project(project_id));

CREATE POLICY "Authenticated users can create tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (public.user_can_access_project(project_id));

CREATE POLICY "Authenticated users can update tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (public.user_can_access_project(project_id));

CREATE POLICY "Authenticated users can delete tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (public.user_can_access_project(project_id));

-- Enable RLS on tasks table if not already enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Also create simple RLS policies for projects table to avoid any circular issues
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      project_manager_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );

CREATE POLICY "Authenticated users can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      project_manager_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );

CREATE POLICY "Authenticated users can delete projects" 
  ON public.projects 
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND (
      project_manager_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );

-- Enable RLS on projects table if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
