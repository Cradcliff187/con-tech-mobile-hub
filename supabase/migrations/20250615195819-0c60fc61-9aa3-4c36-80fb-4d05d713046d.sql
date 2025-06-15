
-- ============================================================================
-- AKC RLS Function Security Fix: Set Secure search_path
-- Summary: This migration fixes the "mutable search_path" security warning
-- by explicitly setting `SET search_path = public` for critical RLS helper
-- functions. This prevents schema injection vulnerabilities.
-- ============================================================================

-- Fix for: public.is_approved_company_user
CREATE OR REPLACE FUNCTION public.is_approved_company_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
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

-- Fix for: public.is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
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

-- Fix for: public.is_project_manager_or_admin
CREATE OR REPLACE FUNCTION public.is_project_manager_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
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

-- Fix for: public.user_can_access_project
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
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

-- Fix for: public.is_company_domain
CREATE OR REPLACE FUNCTION public.is_company_domain(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN email ILIKE '%@austinkunzconstruction.com';
END;
$$;

-- Fix for: public.check_resource_conflicts
CREATE OR REPLACE FUNCTION public.check_resource_conflicts(p_user_id uuid, p_date date, p_hours integer DEFAULT 8)
RETURNS TABLE(conflict_type text, conflicting_allocation_id uuid, conflicting_team_name text, allocated_hours integer, available_hours integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'schedule_conflict'::text as conflict_type,
    ra.id as conflicting_allocation_id,
    ra.team_name,
    tm.hours_allocated,
    (8 - COALESCE(SUM(tm2.hours_allocated), 0))::integer as available_hours
  FROM public.resource_allocations ra
  JOIN public.team_members tm ON tm.allocation_id = ra.id
  LEFT JOIN public.team_members tm2 ON tm2.user_id = p_user_id AND tm2.date = p_date
  WHERE tm.user_id = p_user_id 
    AND (
      (ra.allocation_type = 'daily' AND tm.date = p_date) OR
      (ra.allocation_type = 'weekly' AND p_date >= ra.week_start_date AND p_date < ra.week_start_date + INTERVAL '7 days')
    )
  GROUP BY ra.id, ra.team_name, tm.hours_allocated
  HAVING (COALESCE(SUM(tm2.hours_allocated), 0) + p_hours) > 8;
END;
$$;

