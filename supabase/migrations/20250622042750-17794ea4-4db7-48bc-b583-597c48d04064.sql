
-- Migration: Create cost rollup functions for automatic project cost updates
-- This migration creates functions for automatic cost rollup from assignments to projects

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Function 1: Main cost rollup function
-- Updates project labor costs from stakeholder assignments
CREATE OR REPLACE FUNCTION public.update_project_labor_costs(target_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_spent_amount DECIMAL;
  new_spent_amount DECIMAL;
  cost_difference DECIMAL;
  project_budget DECIMAL;
  new_variance DECIMAL;
  new_variance_percentage DECIMAL;
BEGIN
  -- Get current project spent amount
  SELECT spent, budget INTO old_spent_amount, project_budget
  FROM public.projects
  WHERE id = target_project_id;
  
  -- Calculate new labor costs from stakeholder assignments
  SELECT COALESCE(SUM(total_cost), 0) INTO new_spent_amount
  FROM public.stakeholder_assignments
  WHERE project_id = target_project_id
    AND status IN ('assigned', 'active', 'completed');
  
  -- Calculate difference for audit trail
  cost_difference := new_spent_amount - COALESCE(old_spent_amount, 0);
  
  -- Update project spent amount
  UPDATE public.projects
  SET 
    spent = new_spent_amount,
    updated_at = NOW()
  WHERE id = target_project_id;
  
  -- Calculate budget variance
  new_variance := COALESCE(project_budget, 0) - new_spent_amount;
  new_variance_percentage := CASE 
    WHEN COALESCE(project_budget, 0) > 0 THEN (new_variance / project_budget) * 100
    ELSE 0
  END;
  
  -- Update or insert budget tracking record
  INSERT INTO public.budget_tracking (
    project_id,
    spent_amount,
    variance_amount,
    variance_percentage,
    last_updated,
    updated_by,
    notes
  ) VALUES (
    target_project_id,
    new_spent_amount,
    new_variance,
    new_variance_percentage,
    NOW(),
    auth.uid(),
    'Automatic cost rollup from stakeholder assignments'
  )
  ON CONFLICT (project_id) 
  DO UPDATE SET
    spent_amount = EXCLUDED.spent_amount,
    variance_amount = EXCLUDED.variance_amount,
    variance_percentage = EXCLUDED.variance_percentage,
    last_updated = EXCLUDED.last_updated,
    updated_by = EXCLUDED.updated_by,
    notes = EXCLUDED.notes;
  
  -- Create audit trail entry if there's a significant change
  IF ABS(cost_difference) > 0.01 THEN
    INSERT INTO public.activity_log (
      action,
      entity_type,
      entity_id,
      project_id,
      user_id,
      details
    ) VALUES (
      'cost_update',
      'project',
      target_project_id,
      target_project_id,
      auth.uid(),
      jsonb_build_object(
        'old_amount', old_spent_amount,
        'new_amount', new_spent_amount,
        'difference', cost_difference,
        'variance', new_variance,
        'variance_percentage', new_variance_percentage,
        'trigger', 'assignment_change'
      )
    );
  END IF;
  
END;
$$;

-- Function 2: Trigger function for stakeholder assignments
-- Automatically calls cost rollup when assignments change
CREATE OR REPLACE FUNCTION public.trigger_update_project_labor_costs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Handle INSERT and UPDATE cases
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.project_id IS NOT NULL THEN
      PERFORM public.update_project_labor_costs(NEW.project_id);
    END IF;
  END IF;
  
  -- Handle UPDATE where project_id changed
  IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
    IF OLD.project_id IS NOT NULL THEN
      PERFORM public.update_project_labor_costs(OLD.project_id);
    END IF;
  END IF;
  
  -- Handle DELETE case
  IF TG_OP = 'DELETE' THEN
    IF OLD.project_id IS NOT NULL THEN
      PERFORM public.update_project_labor_costs(OLD.project_id);
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on stakeholder_assignments table
DROP TRIGGER IF EXISTS trigger_stakeholder_assignment_cost_rollup ON public.stakeholder_assignments;
CREATE TRIGGER trigger_stakeholder_assignment_cost_rollup
  AFTER INSERT OR UPDATE OR DELETE ON public.stakeholder_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_project_labor_costs();

-- Function 3: Calculate employee utilization with conflict detection
CREATE OR REPLACE FUNCTION public.calculate_employee_utilization(
  target_stakeholder_id UUID DEFAULT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE(
  stakeholder_id UUID,
  stakeholder_name TEXT,
  date_period DATE,
  total_allocated_hours DECIMAL,
  max_available_hours DECIMAL,
  utilization_percentage DECIMAL,
  is_overallocated BOOLEAN,
  conflict_details JSONB,
  project_assignments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date_period
  ),
  stakeholder_dates AS (
    SELECT 
      s.id AS stakeholder_id,
      s.contact_person AS stakeholder_name,
      ds.date_period
    FROM public.stakeholders s
    CROSS JOIN date_series ds
    WHERE s.stakeholder_type = 'employee'
      AND s.status = 'active'
      AND (target_stakeholder_id IS NULL OR s.id = target_stakeholder_id)
  ),
  daily_assignments AS (
    SELECT 
      sa.stakeholder_id,
      sd.date_period,
      sa.project_id,
      p.name AS project_name,
      sa.role,
      -- Calculate daily hours from weekly allocation
      CASE 
        WHEN sa.week_start_date IS NOT NULL 
          AND sd.date_period >= sa.week_start_date 
          AND sd.date_period < sa.week_start_date + INTERVAL '7 days'
        THEN COALESCE(sa.total_hours, 0) / 7.0
        WHEN sa.start_date IS NOT NULL AND sa.end_date IS NOT NULL
          AND sd.date_period >= sa.start_date 
          AND sd.date_period <= sa.end_date
        THEN COALESCE(sa.total_hours, 0) / GREATEST(1, (sa.end_date - sa.start_date + 1))
        ELSE 0
      END AS daily_hours
    FROM stakeholder_dates sd
    LEFT JOIN public.stakeholder_assignments sa ON sd.stakeholder_id = sa.stakeholder_id
    LEFT JOIN public.projects p ON sa.project_id = p.id
    WHERE sa.status IN ('assigned', 'active')
  ),
  utilization_summary AS (
    SELECT 
      sd.stakeholder_id,
      sd.stakeholder_name,
      sd.date_period,
      COALESCE(SUM(da.daily_hours), 0) AS total_allocated_hours,
      8.0 AS max_available_hours, -- Standard 8-hour workday
      COALESCE(SUM(da.daily_hours), 0) / 8.0 * 100 AS utilization_percentage,
      COALESCE(SUM(da.daily_hours), 0) > 8.0 AS is_overallocated,
      jsonb_agg(
        CASE 
          WHEN da.daily_hours > 0 THEN
            jsonb_build_object(
              'project_id', da.project_id,
              'project_name', da.project_name,
              'role', da.role,
              'daily_hours', da.daily_hours
            )
          ELSE NULL
        END
      ) FILTER (WHERE da.daily_hours > 0) AS project_assignments
    FROM stakeholder_dates sd
    LEFT JOIN daily_assignments da ON sd.stakeholder_id = da.stakeholder_id 
      AND sd.date_period = da.date_period
    GROUP BY sd.stakeholder_id, sd.stakeholder_name, sd.date_period
  )
  SELECT 
    us.stakeholder_id,
    us.stakeholder_name,
    us.date_period,
    us.total_allocated_hours,
    us.max_available_hours,
    us.utilization_percentage,
    us.is_overallocated,
    CASE 
      WHEN us.is_overallocated THEN
        jsonb_build_object(
          'type', 'overallocation',
          'allocated_hours', us.total_allocated_hours,
          'available_hours', us.max_available_hours,
          'excess_hours', us.total_allocated_hours - us.max_available_hours
        )
      ELSE NULL
    END AS conflict_details,
    COALESCE(us.project_assignments, '[]'::jsonb) AS project_assignments
  FROM utilization_summary us
  ORDER BY us.stakeholder_id, us.date_period;
END;
$$;

-- Function 4: Daily cost snapshot function
CREATE OR REPLACE FUNCTION public.create_daily_cost_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  snapshot_date DATE := CURRENT_DATE;
BEGIN
  -- Create cost snapshots for all active projects
  FOR project_record IN 
    SELECT id, name, budget, spent 
    FROM public.projects 
    WHERE status IN ('active', 'planning', 'in_progress')
  LOOP
    -- Update budget tracking with current snapshot
    INSERT INTO public.budget_tracking (
      project_id,
      spent_amount,
      committed_amount,
      projected_total,
      variance_amount,
      variance_percentage,
      last_updated,
      notes
    ) 
    SELECT 
      project_record.id,
      project_record.spent,
      -- Calculate committed amount from pending assignments
      COALESCE((
        SELECT SUM(total_cost) 
        FROM public.stakeholder_assignments 
        WHERE project_id = project_record.id 
          AND status = 'assigned'
      ), 0),
      -- Projected total = spent + committed
      project_record.spent + COALESCE((
        SELECT SUM(total_cost) 
        FROM public.stakeholder_assignments 
        WHERE project_id = project_record.id 
          AND status = 'assigned'
      ), 0),
      -- Variance = budget - projected total
      COALESCE(project_record.budget, 0) - (
        project_record.spent + COALESCE((
          SELECT SUM(total_cost) 
          FROM public.stakeholder_assignments 
          WHERE project_id = project_record.id 
            AND status = 'assigned'
        ), 0)
      ),
      -- Variance percentage
      CASE 
        WHEN COALESCE(project_record.budget, 0) > 0 THEN
          (COALESCE(project_record.budget, 0) - (
            project_record.spent + COALESCE((
              SELECT SUM(total_cost) 
              FROM public.stakeholder_assignments 
              WHERE project_id = project_record.id 
                AND status = 'assigned'
            ), 0)
          )) / project_record.budget * 100
        ELSE 0
      END,
      NOW(),
      'Daily cost snapshot - ' || snapshot_date::text
    ON CONFLICT (project_id) 
    DO UPDATE SET
      spent_amount = EXCLUDED.spent_amount,
      committed_amount = EXCLUDED.committed_amount,
      projected_total = EXCLUDED.projected_total,
      variance_amount = EXCLUDED.variance_amount,
      variance_percentage = EXCLUDED.variance_percentage,
      last_updated = EXCLUDED.last_updated,
      notes = EXCLUDED.notes;
      
    -- Log the snapshot creation
    INSERT INTO public.activity_log (
      action,
      entity_type,
      entity_id,
      project_id,
      details
    ) VALUES (
      'cost_snapshot',
      'project',
      project_record.id,
      project_record.id,
      jsonb_build_object(
        'snapshot_date', snapshot_date,
        'spent_amount', project_record.spent,
        'budget', project_record.budget,
        'type', 'daily_scheduled'
      )
    );
  END LOOP;
  
  RAISE NOTICE 'Daily cost snapshot completed for % projects', 
    (SELECT COUNT(*) FROM public.projects WHERE status IN ('active', 'planning', 'in_progress'));
END;
$$;

-- Schedule daily cost snapshots (runs at midnight)
SELECT cron.schedule(
  'daily-cost-snapshots',
  '0 0 * * *', -- Every day at midnight
  $$SELECT public.create_daily_cost_snapshot();$$
);

-- Add helpful comments
COMMENT ON FUNCTION public.update_project_labor_costs(UUID) IS 'Updates project labor costs from stakeholder assignments and maintains audit trail';
COMMENT ON FUNCTION public.trigger_update_project_labor_costs() IS 'Trigger function that automatically updates project costs when assignments change';
COMMENT ON FUNCTION public.calculate_employee_utilization(UUID, DATE, DATE) IS 'Calculates employee utilization and detects scheduling conflicts across projects';
COMMENT ON FUNCTION public.create_daily_cost_snapshot() IS 'Creates daily cost snapshots for all active projects with variance calculations';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_project_labor_costs(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_employee_utilization(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_daily_cost_snapshot() TO service_role;
