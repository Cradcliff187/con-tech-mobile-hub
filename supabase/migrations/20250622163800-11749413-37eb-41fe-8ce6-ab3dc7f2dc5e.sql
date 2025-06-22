
-- Migration: Fix SECURITY DEFINER views by recreating without SECURITY DEFINER
-- This migration addresses the Supabase security linter warnings

-- 1. Drop existing views that have SECURITY DEFINER
DROP VIEW IF EXISTS public.migration_summary CASCADE;
DROP VIEW IF EXISTS public.project_labor_costs CASCADE;

-- 2. Recreate migration_summary view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.migration_summary AS
SELECT 
  operation,
  COUNT(*) as count,
  MAX(created_at) as latest_occurrence
FROM public.migration_log 
GROUP BY operation
ORDER BY latest_occurrence DESC;

-- 3. Recreate project_labor_costs view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.project_labor_costs AS
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

-- 4. Enable RLS on migration_log table if not already enabled
ALTER TABLE public.migration_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for migration_log (admin only access)
DROP POLICY IF EXISTS "Admin users can view migration logs" ON public.migration_log;
CREATE POLICY "Admin users can view migration logs" ON public.migration_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_company_user = true
        AND profiles.account_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admin users can manage migration logs" ON public.migration_log;
CREATE POLICY "Admin users can manage migration logs" ON public.migration_log
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

-- 6. Enable RLS on team_members_backup table if not already enabled
ALTER TABLE public.team_members_backup ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policy for team_members_backup (admin only access)
DROP POLICY IF EXISTS "Admin users can view team members backup" ON public.team_members_backup;
CREATE POLICY "Admin users can view team members backup" ON public.team_members_backup
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_company_user = true
        AND profiles.account_status = 'approved'
    )
  );

-- 8. Grant appropriate permissions to authenticated users for views
GRANT SELECT ON public.migration_summary TO authenticated;
GRANT SELECT ON public.project_labor_costs TO authenticated;

-- 9. Add comments for documentation
COMMENT ON VIEW public.migration_summary IS 'Summary view of migration operations (no SECURITY DEFINER)';
COMMENT ON VIEW public.project_labor_costs IS 'Aggregated view of employee labor costs by project (no SECURITY DEFINER)';
COMMENT ON TABLE public.migration_log IS 'Tracks data migration operations with RLS enabled - admin access only';
COMMENT ON TABLE public.team_members_backup IS 'Backup of original team_members data with RLS enabled - admin access only';
