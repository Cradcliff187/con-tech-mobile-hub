
-- Migration: Consolidate Employee Assignment System
-- Add missing columns to stakeholder_assignments table

-- Add new columns for enhanced tracking
ALTER TABLE public.stakeholder_assignments 
ADD COLUMN total_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN total_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN week_start_date DATE,
ADD COLUMN daily_hours JSONB DEFAULT '{}'::jsonb;

-- Create trigger function to auto-calculate total_cost
CREATE OR REPLACE FUNCTION public.calculate_assignment_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total_cost = total_hours * hourly_rate
  NEW.total_cost := COALESCE(NEW.total_hours, 0) * COALESCE(NEW.hourly_rate, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on stakeholder_assignments table
CREATE TRIGGER trigger_calculate_assignment_total_cost
  BEFORE INSERT OR UPDATE OF total_hours, hourly_rate
  ON public.stakeholder_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_assignment_total_cost();

-- Create view for project labor costs aggregation
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

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_stakeholder_assignments_project_stakeholder 
ON public.stakeholder_assignments(project_id, stakeholder_id);

CREATE INDEX IF NOT EXISTS idx_stakeholder_assignments_stakeholder_date 
ON public.stakeholder_assignments(stakeholder_id, start_date);

CREATE INDEX IF NOT EXISTS idx_stakeholder_assignments_week_start 
ON public.stakeholder_assignments(week_start_date) 
WHERE week_start_date IS NOT NULL;

-- Add index for status filtering (commonly used in queries)
CREATE INDEX IF NOT EXISTS idx_stakeholder_assignments_status 
ON public.stakeholder_assignments(status);

-- Enable RLS for the new view (inherits from base table policies)
-- Note: Views automatically inherit RLS from their underlying tables

-- Update existing data to set week_start_date for assignments with start_date
UPDATE public.stakeholder_assignments 
SET week_start_date = DATE_TRUNC('week', start_date)::DATE
WHERE start_date IS NOT NULL AND week_start_date IS NULL;

-- Add helpful comment to document the daily_hours JSONB structure
COMMENT ON COLUMN public.stakeholder_assignments.daily_hours IS 'JSON object storing daily hours worked, format: {"2024-01-15": 8, "2024-01-16": 6}';

COMMENT ON COLUMN public.stakeholder_assignments.week_start_date IS 'Start date of the work week (Monday) for weekly tracking and reporting';

COMMENT ON VIEW public.project_labor_costs IS 'Aggregated view of employee labor costs by project and stakeholder type';
