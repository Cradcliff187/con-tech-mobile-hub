
-- RLS Refactoring to Eliminate Infinite Recursion

-- Summary:
-- This migration refactors Row Level Security policies across multiple tables
-- to eliminate "infinite recursion" errors. The issue stems from policies
-- on a table containing subqueries that select from the same table.

-- Solution:
-- 1. Create SECURITY DEFINER helper functions to check user status and roles,
--    which safely bypass RLS for the check and prevent recursion.
-- 2. Update the core `user_can_access_project` function to use a helper function.
-- 3. Drop and recreate all policies that use the recursive pattern,
--    replacing them with calls to the new, safe helper functions.

-- ============================================================================
-- 1. Create Helper Functions
-- ============================================================================

-- Checks if the currently authenticated user is a company user with an 'approved' status.
CREATE OR REPLACE FUNCTION public.is_approved_company_user()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_company_user = true
      AND account_status = 'approved'
  );
END;
$$;

-- Checks if the currently authenticated user is an 'admin'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_company_user = true
      AND account_status = 'approved'
      AND role = 'admin'
  );
END;
$$;

-- Checks if the currently authenticated user is a 'project_manager' or 'admin'.
CREATE OR REPLACE FUNCTION public.is_project_manager_or_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_company_user = true
      AND account_status = 'approved'
      AND role IN ('admin', 'project_manager')
  );
END;
$$;

-- ============================================================================
-- 2. Update Core Access Function
-- ============================================================================

-- This function is used by many policies. Updating it fixes them indirectly.
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (
      p.project_manager_id = auth.uid() OR
      public.is_approved_company_user()
    )
  );
END;
$$;


-- ============================================================================
-- 3. Drop and Recreate Policies
-- ============================================================================

-- Profiles Table
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Company users can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Approved company users can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_approved_company_user());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());


-- Projects Table
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON public.projects;

CREATE POLICY "Users can view their assigned projects"
  ON public.projects FOR SELECT
  USING (project_manager_id = auth.uid());

CREATE POLICY "Approved company users can view all projects"
  ON public.projects FOR SELECT
  USING (public.is_approved_company_user());

CREATE POLICY "Clients can view their projects" 
  ON public.projects FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.stakeholders s
      WHERE s.id = client_id
      AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "Approved company users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_approved_company_user());

CREATE POLICY "Users can update their assigned projects"
  ON public.projects FOR UPDATE
  USING (project_manager_id = auth.uid());
  
CREATE POLICY "Approved company users can update any project"
  ON public.projects FOR UPDATE
  USING (public.is_approved_company_user());

CREATE POLICY "Users can delete their assigned projects"
  ON public.projects FOR DELETE
  USING (project_manager_id = auth.uid());

CREATE POLICY "Approved company users can delete any project"
  ON public.projects FOR DELETE
  USING (public.is_approved_company_user());


-- Stakeholders Table
DROP POLICY IF EXISTS "Users can view their stakeholder profiles" ON public.stakeholders;
DROP POLICY IF EXISTS "Company users can manage stakeholders" ON public.stakeholders;

CREATE POLICY "Users can view their own stakeholder record" ON public.stakeholders
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Approved company users can view all stakeholders" ON public.stakeholders
  FOR SELECT USING (public.is_approved_company_user());

CREATE POLICY "Approved company users can manage stakeholders" ON public.stakeholders
  FOR ALL USING (public.is_approved_company_user());

-- Resource Allocations Table
DROP POLICY IF EXISTS "AKC users can view resource allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "AKC managers can manage resource allocations" ON public.resource_allocations;

CREATE POLICY "Approved company users can view resource allocations"
  ON public.resource_allocations FOR SELECT
  USING (public.is_approved_company_user());

CREATE POLICY "Project managers and admins can manage resource allocations"
  ON public.resource_allocations FOR ALL
  USING (public.is_project_manager_or_admin());

-- Team Members Table
DROP POLICY IF EXISTS "AKC users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "AKC managers can manage team members" ON public.team_members;

CREATE POLICY "Approved company users can view team members"
  ON public.team_members FOR SELECT
  USING (public.is_approved_company_user());

CREATE POLICY "Project managers and admins can manage team members"
  ON public.team_members FOR ALL
  USING (public.is_project_manager_or_admin());

-- Weather Data Table
DROP POLICY IF EXISTS "All users can view weather data" ON public.weather_data;
DROP POLICY IF EXISTS "AKC users can manage weather data" ON public.weather_data;
DROP POLICY IF EXISTS "AKC users can update weather data" ON public.weather_data;
DROP POLICY IF EXISTS "AKC users can delete weather data" ON public.weather_data;

CREATE POLICY "Authenticated users can view weather data"
  ON public.weather_data FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Approved company users can manage weather data"
  ON public.weather_data FOR ALL
  USING (public.is_approved_company_user());

-- Documents Table
DROP POLICY IF EXISTS "Users can view documents in accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Company users can manage documents" ON public.documents;

CREATE POLICY "Users can view documents in accessible projects"
  ON public.documents FOR SELECT
  USING (public.user_can_access_project(project_id));

CREATE POLICY "Approved company users can manage documents"
  ON public.documents FOR ALL
  USING (public.is_approved_company_user());

-- Equipment Table
DROP POLICY IF EXISTS "Users can view equipment in accessible projects" ON public.equipment;
DROP POLICY IF EXISTS "Company users can manage equipment" ON public.equipment;

CREATE POLICY "Users can view equipment"
  ON public.equipment FOR SELECT
  USING (auth.uid() IS NOT NULL AND (
    project_id IS NULL OR
    public.user_can_access_project(project_id)
  ));

CREATE POLICY "Approved company users can manage equipment"
  ON public.equipment FOR ALL
  USING (public.is_approved_company_user());
