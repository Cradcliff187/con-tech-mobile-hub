
-- Migration: Fix Security Issues for Employee Consolidation
-- This migration addresses the security issues identified by Supabase linter

-- 1. Fix SECURITY DEFINER views by recreating them without SECURITY DEFINER
-- Drop and recreate migration_summary view
DROP VIEW IF EXISTS public.migration_summary;
CREATE OR REPLACE VIEW public.migration_summary AS
SELECT 
  operation,
  COUNT(*) as count,
  MAX(created_at) as latest_occurrence
FROM public.migration_log 
GROUP BY operation
ORDER BY latest_occurrence DESC;

-- Drop and recreate project_labor_costs view
DROP VIEW IF EXISTS public.project_labor_costs;
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

-- 2. Enable RLS on migration_log table
ALTER TABLE public.migration_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for migration_log (admin only)
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

-- 3. Enable RLS on team_members_backup table
ALTER TABLE public.team_members_backup ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for team_members_backup (admin only)
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

-- No insert/update/delete policies for backup table - it's read-only

-- 4. Grant appropriate permissions to authenticated users for views
GRANT SELECT ON public.migration_summary TO authenticated;
GRANT SELECT ON public.project_labor_costs TO authenticated;

-- 5. Add comments for documentation
COMMENT ON VIEW public.migration_summary IS 'Summary view of migration operations (no SECURITY DEFINER)';
COMMENT ON VIEW public.project_labor_costs IS 'Aggregated view of employee labor costs by project (no SECURITY DEFINER)';
COMMENT ON TABLE public.migration_log IS 'Tracks data migration operations with RLS enabled - admin access only';
COMMENT ON TABLE public.team_members_backup IS 'Backup of original team_members data with RLS enabled - admin access only';
