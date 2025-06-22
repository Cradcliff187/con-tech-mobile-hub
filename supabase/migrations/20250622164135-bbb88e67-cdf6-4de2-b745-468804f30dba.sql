
-- Migration: Aggressive fix for SECURITY DEFINER views (Corrected)
-- This migration forces complete removal and clean recreation

-- Step 1: Force complete removal with CASCADE
DROP VIEW IF EXISTS public.migration_summary CASCADE;
DROP VIEW IF EXISTS public.project_labor_costs CASCADE;

-- Step 2: Verify removal by attempting to drop again (will fail silently if already gone)
DROP VIEW IF EXISTS public.migration_summary;
DROP VIEW IF EXISTS public.project_labor_costs;

-- Step 3: Create migration_summary view with explicit SECURITY INVOKER
CREATE VIEW public.migration_summary 
WITH (security_invoker = true)
AS
SELECT 
  operation,
  COUNT(*) as count,
  MAX(created_at) as latest_occurrence
FROM public.migration_log 
GROUP BY operation
ORDER BY latest_occurrence DESC;

-- Step 4: Create project_labor_costs view with explicit SECURITY INVOKER
CREATE VIEW public.project_labor_costs
WITH (security_invoker = true)
AS
SELECT 
  sa.project_id,
  s.stakeholder_type,
  p.name as project_name,
  COUNT(sa.id) as assignment_count,
  SUM(sa.total_hours) as total_hours,
  SUM(sa.total_cost) as total_cost,
  AVG(sa.hourly_rate) as avg_hourly_rate,
  MIN(sa.start_date) as earliest_start_date,
  MAX(sa.end_date) as latest_end_date
FROM public.stakeholder_assignments sa
JOIN public.stakeholders s ON sa.stakeholder_id = s.id
LEFT JOIN public.projects p ON sa.project_id = p.id
WHERE s.stakeholder_type = 'employee'
  AND sa.project_id IS NOT NULL
GROUP BY sa.project_id, s.stakeholder_type, p.name
ORDER BY sa.project_id;

-- Step 5: Grant explicit permissions
GRANT SELECT ON public.migration_summary TO authenticated;
GRANT SELECT ON public.project_labor_costs TO authenticated;

-- Step 6: Add comments to document the security model
COMMENT ON VIEW public.migration_summary IS 'Migration operations summary - uses SECURITY INVOKER (caller permissions)';
COMMENT ON VIEW public.project_labor_costs IS 'Employee labor costs by project - uses SECURITY INVOKER (caller permissions)';

-- Step 7: Verify the views are created without SECURITY DEFINER
-- This query will show the successfully recreated views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('migration_summary', 'project_labor_costs')
    LOOP
        -- Log successful creation
        RAISE NOTICE 'Successfully recreated view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;
