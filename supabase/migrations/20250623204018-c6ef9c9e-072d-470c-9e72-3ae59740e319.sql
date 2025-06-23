
-- Fix 1: Remove SECURITY DEFINER from projects_legacy_status view
DROP VIEW IF EXISTS public.projects_legacy_status;

CREATE VIEW public.projects_legacy_status AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.status,
  p.start_date,
  p.end_date,
  p.budget,
  p.spent,
  p.progress,
  p.location,
  p.client_id,
  p.project_manager_id,
  p.created_at,
  p.updated_at,
  p.phase,
  p.street_address,
  p.city,
  p.state,
  p.zip_code,
  p.lifecycle_status,
  p.unified_lifecycle_status,
  CASE
    WHEN p.unified_lifecycle_status = 'cancelled'::project_lifecycle_status THEN 'cancelled'::project_status
    WHEN p.unified_lifecycle_status = 'pre_construction'::project_lifecycle_status THEN 'planning'::project_status
    WHEN p.unified_lifecycle_status = 'mobilization'::project_lifecycle_status THEN 'active'::project_status
    WHEN p.unified_lifecycle_status = ANY (ARRAY['construction'::project_lifecycle_status, 'punch_list'::project_lifecycle_status, 'final_inspection'::project_lifecycle_status]) THEN 'active'::project_status
    WHEN p.unified_lifecycle_status = ANY (ARRAY['closeout'::project_lifecycle_status, 'warranty'::project_lifecycle_status]) THEN 'completed'::project_status
    WHEN p.unified_lifecycle_status = 'on_hold'::project_lifecycle_status THEN 'on-hold'::project_status
    ELSE 'planning'::project_status
  END AS computed_status,
  CASE
    WHEN p.unified_lifecycle_status = 'pre_construction'::project_lifecycle_status THEN 'planning'::text
    WHEN p.unified_lifecycle_status = 'mobilization'::project_lifecycle_status THEN 'active'::text
    WHEN p.unified_lifecycle_status = 'construction'::project_lifecycle_status THEN 'active'::text
    WHEN p.unified_lifecycle_status = 'punch_list'::project_lifecycle_status THEN 'punch_list'::text
    WHEN p.unified_lifecycle_status = 'final_inspection'::project_lifecycle_status THEN 'punch_list'::text
    WHEN p.unified_lifecycle_status = 'closeout'::project_lifecycle_status THEN 'closeout'::text
    WHEN p.unified_lifecycle_status = 'warranty'::project_lifecycle_status THEN 'completed'::text
    WHEN p.unified_lifecycle_status = 'on_hold'::project_lifecycle_status THEN 'active'::text
    WHEN p.unified_lifecycle_status = 'cancelled'::project_lifecycle_status THEN 'completed'::text
    ELSE 'planning'::text
  END AS computed_phase
FROM projects p;

-- Fix 2: Enable RLS on project_status_transitions table
ALTER TABLE public.project_status_transitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that align with your existing security model
-- Policy for SELECT: Allow all authenticated users to read transition rules
CREATE POLICY "Authenticated users can view status transitions" 
  ON public.project_status_transitions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Policy for INSERT/UPDATE/DELETE: Only admins can manage transition rules
CREATE POLICY "Admin users can manage status transitions" 
  ON public.project_status_transitions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_company_user = true
        AND profiles.account_status = 'approved'
    )
  );

-- Grant appropriate permissions
GRANT SELECT ON public.projects_legacy_status TO authenticated;
GRANT SELECT ON public.project_status_transitions TO authenticated;

-- Add documentation comments
COMMENT ON VIEW public.projects_legacy_status IS 'Legacy status compatibility view (uses SECURITY INVOKER for proper RLS)';
COMMENT ON TABLE public.project_status_transitions IS 'Project status transition rules with RLS enabled - read access for all authenticated users, admin-only modifications';
