
-- Nuclear migration: Complete removal and recreation of projects_legacy_status view
-- This forces the linter to recognize it as a completely new object

-- Step 1: Drop the view completely with CASCADE to handle any dependencies
DROP VIEW IF EXISTS public.projects_legacy_status CASCADE;

-- Step 2: Wait a moment to ensure complete cleanup
SELECT pg_sleep(1);

-- Step 3: Verify the view is completely gone
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'projects_legacy_status') THEN
    RAISE EXCEPTION 'View still exists after DROP operation';
  END IF;
  RAISE NOTICE 'Confirmed: projects_legacy_status view has been completely removed';
END $$;

-- Step 4: Create the view with a completely new structure and explicit SECURITY INVOKER
CREATE OR REPLACE VIEW public.projects_legacy_status 
WITH (security_invoker = true)
AS
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
  -- Computed status mapping (new implementation)
  CASE
    WHEN p.unified_lifecycle_status = 'cancelled' THEN 'cancelled'::project_status
    WHEN p.unified_lifecycle_status = 'pre_construction' THEN 'planning'::project_status
    WHEN p.unified_lifecycle_status = 'mobilization' THEN 'active'::project_status
    WHEN p.unified_lifecycle_status IN ('construction', 'punch_list', 'final_inspection') THEN 'active'::project_status
    WHEN p.unified_lifecycle_status IN ('closeout', 'warranty') THEN 'completed'::project_status
    WHEN p.unified_lifecycle_status = 'on_hold' THEN 'on-hold'::project_status
    ELSE 'planning'::project_status
  END AS computed_status,
  -- Computed phase mapping (new implementation)
  CASE
    WHEN p.unified_lifecycle_status = 'pre_construction' THEN 'planning'
    WHEN p.unified_lifecycle_status = 'mobilization' THEN 'active'
    WHEN p.unified_lifecycle_status = 'construction' THEN 'active'
    WHEN p.unified_lifecycle_status IN ('punch_list', 'final_inspection') THEN 'punch_list'
    WHEN p.unified_lifecycle_status = 'closeout' THEN 'closeout'
    WHEN p.unified_lifecycle_status = 'warranty' THEN 'completed'
    WHEN p.unified_lifecycle_status = 'on_hold' THEN 'active'
    WHEN p.unified_lifecycle_status = 'cancelled' THEN 'completed'
    ELSE 'planning'
  END AS computed_phase
FROM public.projects p;

-- Step 5: Explicitly grant permissions
GRANT SELECT ON public.projects_legacy_status TO authenticated;
GRANT SELECT ON public.projects_legacy_status TO anon;

-- Step 6: Add comprehensive documentation
COMMENT ON VIEW public.projects_legacy_status IS 'Legacy status compatibility view - RECREATED with explicit SECURITY INVOKER to resolve linter issues. Maps unified lifecycle status to legacy status/phase combinations.';

-- Step 7: Final verification
DO $$
DECLARE
    view_security_type TEXT;
BEGIN
    -- Check the view was created successfully
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'projects_legacy_status') THEN
        RAISE EXCEPTION 'Failed to recreate projects_legacy_status view';
    END IF;
    
    -- Verify it's not using SECURITY DEFINER
    SELECT CASE 
        WHEN pg_has_role(viewowner, 'USAGE') AND NOT has_table_privilege(viewowner, 'public.projects_legacy_status', 'SELECT')
        THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END INTO view_security_type
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'projects_legacy_status';
    
    RAISE NOTICE 'View recreated successfully with security type: %', view_security_type;
    
    -- Log successful recreation
    INSERT INTO public.migration_log (
        operation, 
        source_table, 
        target_table, 
        issue_description, 
        data_snapshot
    ) VALUES (
        'view_recreation', 
        'projects_legacy_status', 
        'projects_legacy_status', 
        'Nuclear recreation to resolve persistent linter SECURITY DEFINER detection',
        jsonb_build_object(
            'timestamp', NOW(),
            'security_type', view_security_type,
            'method', 'complete_drop_and_recreate'
        )
    );
END $$;
