
-- Create unified project lifecycle status migration
-- This migration consolidates status+phase into a single lifecycle_status field

-- Create the new project lifecycle status enum
CREATE TYPE public.project_lifecycle_status AS ENUM (
  'pre_construction',
  'mobilization', 
  'construction',
  'punch_list',
  'final_inspection',
  'closeout',
  'warranty',
  'on_hold',
  'cancelled'
);

-- Add the new unified lifecycle status column to projects table
ALTER TABLE public.projects 
ADD COLUMN unified_lifecycle_status public.project_lifecycle_status;

-- Create intelligent migration function to map existing status+phase to new lifecycle_status
CREATE OR REPLACE FUNCTION public.migrate_to_unified_lifecycle_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update unified_lifecycle_status based on current status and phase combinations
  UPDATE public.projects SET unified_lifecycle_status = CASE
    -- Cancelled projects always map to cancelled
    WHEN status = 'cancelled' THEN 'cancelled'::public.project_lifecycle_status
    
    -- Planning status projects
    WHEN status = 'planning' AND (phase IS NULL OR phase = 'planning') THEN 'pre_construction'::public.project_lifecycle_status
    WHEN status = 'planning' AND phase = 'active' THEN 'mobilization'::public.project_lifecycle_status
    
    -- Active status projects with different phases
    WHEN status = 'active' AND (phase IS NULL OR phase = 'planning') THEN 'mobilization'::public.project_lifecycle_status
    WHEN status = 'active' AND phase = 'active' THEN 'construction'::public.project_lifecycle_status
    WHEN status = 'active' AND phase = 'punch_list' THEN 'punch_list'::public.project_lifecycle_status
    WHEN status = 'active' AND phase = 'closeout' THEN 'closeout'::public.project_lifecycle_status
    WHEN status = 'active' AND phase = 'completed' THEN 'warranty'::public.project_lifecycle_status
    
    -- On-hold projects
    WHEN status = 'on-hold' THEN 'on_hold'::public.project_lifecycle_status
    
    -- Completed projects map to warranty period
    WHEN status = 'completed' AND phase = 'completed' THEN 'warranty'::public.project_lifecycle_status
    WHEN status = 'completed' THEN 'closeout'::public.project_lifecycle_status
    
    -- Default fallbacks
    WHEN status = 'planning' THEN 'pre_construction'::public.project_lifecycle_status
    WHEN status = 'active' THEN 'construction'::public.project_lifecycle_status
    
    -- Final fallback
    ELSE 'pre_construction'::public.project_lifecycle_status
  END
  WHERE unified_lifecycle_status IS NULL;
END;
$$;

-- Run the migration function
SELECT public.migrate_to_unified_lifecycle_status();

-- Create project status transitions validation table
CREATE TABLE public.project_status_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_status public.project_lifecycle_status NOT NULL,
  to_status public.project_lifecycle_status NOT NULL,
  required_conditions JSONB DEFAULT '{}',
  min_progress_threshold INTEGER DEFAULT 0,
  requires_approval BOOLEAN DEFAULT false,
  transition_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(from_status, to_status)
);

-- Insert valid status transitions
INSERT INTO public.project_status_transitions (from_status, to_status, transition_name, description, min_progress_threshold, required_conditions) VALUES
  ('pre_construction', 'mobilization', 'Start Mobilization', 'Begin mobilizing resources and equipment to site', 0, '{"permits_required": true, "contracts_signed": true}'),
  ('mobilization', 'construction', 'Begin Construction', 'Start active construction work', 10, '{"site_prepared": true, "crew_assigned": true}'),
  ('construction', 'punch_list', 'Enter Punch List Phase', 'Begin final quality inspections and corrections', 85, '{"major_work_complete": true}'),
  ('punch_list', 'final_inspection', 'Schedule Final Inspection', 'Ready for final municipal/client inspection', 95, '{"punch_items_complete": true}'),
  ('final_inspection', 'closeout', 'Begin Project Closeout', 'Start administrative and financial closeout', 98, '{"inspection_passed": true}'),
  ('closeout', 'warranty', 'Enter Warranty Period', 'Project complete, warranty period begins', 100, '{"final_payment_received": true, "documentation_complete": true}'),
  
  -- Hold transitions (can happen from any active status)
  ('pre_construction', 'on_hold', 'Place on Hold', 'Temporarily suspend project', 0, '{}'),
  ('mobilization', 'on_hold', 'Place on Hold', 'Temporarily suspend project', 0, '{}'),
  ('construction', 'on_hold', 'Place on Hold', 'Temporarily suspend project', 0, '{}'),
  ('punch_list', 'on_hold', 'Place on Hold', 'Temporarily suspend project', 0, '{}'),
  
  -- Resume transitions (from hold back to appropriate status)
  ('on_hold', 'pre_construction', 'Resume Pre-Construction', 'Resume project planning activities', 0, '{}'),
  ('on_hold', 'mobilization', 'Resume Mobilization', 'Resume mobilization activities', 0, '{}'),
  ('on_hold', 'construction', 'Resume Construction', 'Resume active construction work', 0, '{}'),
  ('on_hold', 'punch_list', 'Resume Punch List', 'Resume punch list activities', 0, '{}'),
  
  -- Cancellation transitions (can happen from any status except warranty)
  ('pre_construction', 'cancelled', 'Cancel Project', 'Permanently cancel project', 0, '{"requires_approval": true}'),
  ('mobilization', 'cancelled', 'Cancel Project', 'Permanently cancel project', 0, '{"requires_approval": true}'),
  ('construction', 'cancelled', 'Cancel Project', 'Permanently cancel project', 0, '{"requires_approval": true}'),
  ('punch_list', 'cancelled', 'Cancel Project', 'Permanently cancel project', 0, '{"requires_approval": true}'),
  ('on_hold', 'cancelled', 'Cancel Project', 'Permanently cancel project', 0, '{"requires_approval": true}');

-- Create backward compatibility view
CREATE OR REPLACE VIEW public.projects_legacy_status AS
SELECT 
  p.*,
  -- Map unified_lifecycle_status back to legacy status
  CASE 
    WHEN p.unified_lifecycle_status = 'cancelled' THEN 'cancelled'::project_status
    WHEN p.unified_lifecycle_status = 'pre_construction' THEN 'planning'::project_status
    WHEN p.unified_lifecycle_status = 'mobilization' THEN 'active'::project_status
    WHEN p.unified_lifecycle_status IN ('construction', 'punch_list', 'final_inspection') THEN 'active'::project_status
    WHEN p.unified_lifecycle_status IN ('closeout', 'warranty') THEN 'completed'::project_status
    WHEN p.unified_lifecycle_status = 'on_hold' THEN 'on-hold'::project_status
    ELSE 'planning'::project_status
  END AS computed_status,
  
  -- Map unified_lifecycle_status back to legacy phase
  CASE 
    WHEN p.unified_lifecycle_status = 'pre_construction' THEN 'planning'
    WHEN p.unified_lifecycle_status = 'mobilization' THEN 'active'
    WHEN p.unified_lifecycle_status = 'construction' THEN 'active'
    WHEN p.unified_lifecycle_status = 'punch_list' THEN 'punch_list'
    WHEN p.unified_lifecycle_status = 'final_inspection' THEN 'punch_list'
    WHEN p.unified_lifecycle_status = 'closeout' THEN 'closeout'
    WHEN p.unified_lifecycle_status = 'warranty' THEN 'completed'
    WHEN p.unified_lifecycle_status = 'on_hold' THEN 'active'
    WHEN p.unified_lifecycle_status = 'cancelled' THEN 'completed'
    ELSE 'planning'
  END AS computed_phase
FROM public.projects p;

-- Create function to validate status transitions
CREATE OR REPLACE FUNCTION public.validate_project_status_transition(
  project_id UUID,
  new_status public.project_lifecycle_status
)
RETURNS TABLE(is_valid BOOLEAN, error_message TEXT, required_conditions JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
  current_status public.project_lifecycle_status;
  project_progress INTEGER;
  transition_record RECORD;
BEGIN
  -- Get current project status and progress
  SELECT p.unified_lifecycle_status, p.progress
  INTO current_status, project_progress
  FROM public.projects p
  WHERE p.id = project_id;
  
  -- If no current status, allow any initial status
  IF current_status IS NULL THEN
    RETURN QUERY SELECT true, NULL::TEXT, '{}'::JSONB;
    RETURN;
  END IF;
  
  -- If status is not changing, always valid
  IF current_status = new_status THEN
    RETURN QUERY SELECT true, NULL::TEXT, '{}'::JSONB;
    RETURN;
  END IF;
  
  -- Check if transition exists in our validation table
  SELECT * INTO transition_record
  FROM public.project_status_transitions
  WHERE from_status = current_status 
    AND to_status = new_status
    AND is_active = true;
  
  -- If no valid transition found
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      'Invalid status transition from ' || current_status || ' to ' || new_status,
      '{}'::JSONB;
    RETURN;
  END IF;
  
  -- Check progress threshold
  IF project_progress < transition_record.min_progress_threshold THEN
    RETURN QUERY SELECT 
      false,
      'Project progress (' || project_progress || '%) is below required threshold (' || transition_record.min_progress_threshold || '%)',
      transition_record.required_conditions;
    RETURN;
  END IF;
  
  -- Transition is valid
  RETURN QUERY SELECT 
    true,
    NULL::TEXT,
    transition_record.required_conditions;
END;
$$;

-- Create trigger function to validate status changes
CREATE OR REPLACE FUNCTION public.validate_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  validation_result RECORD;
BEGIN
  -- Only validate if unified_lifecycle_status is changing
  IF OLD.unified_lifecycle_status IS DISTINCT FROM NEW.unified_lifecycle_status THEN
    
    -- Validate the transition
    SELECT * INTO validation_result
    FROM public.validate_project_status_transition(NEW.id, NEW.unified_lifecycle_status)
    LIMIT 1;
    
    -- If validation fails, prevent the update
    IF NOT validation_result.is_valid THEN
      RAISE EXCEPTION 'Status transition validation failed: %', validation_result.error_message;
    END IF;
    
    -- Log the status change
    INSERT INTO public.activity_log (
      action,
      entity_type,
      entity_id,
      project_id,
      user_id,
      details
    ) VALUES (
      'status_change',
      'project',
      NEW.id,
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'old_status', OLD.unified_lifecycle_status,
        'new_status', NEW.unified_lifecycle_status,
        'validation_passed', validation_result.is_valid,
        'required_conditions', validation_result.required_conditions
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the validation trigger
DROP TRIGGER IF EXISTS validate_project_status_transition_trigger ON public.projects;
CREATE TRIGGER validate_project_status_transition_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_project_status_change();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_unified_lifecycle_status ON public.projects(unified_lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_project_status_transitions_from_to ON public.project_status_transitions(from_status, to_status);

-- Create rollback function for safety
CREATE OR REPLACE FUNCTION public.rollback_unified_lifecycle_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Drop the trigger first
  DROP TRIGGER IF EXISTS validate_project_status_transition_trigger ON public.projects;
  
  -- Drop the validation function
  DROP FUNCTION IF EXISTS public.validate_project_status_change();
  DROP FUNCTION IF EXISTS public.validate_project_status_transition(UUID, public.project_lifecycle_status);
  
  -- Drop the view
  DROP VIEW IF EXISTS public.projects_legacy_status;
  
  -- Drop the transitions table
  DROP TABLE IF EXISTS public.project_status_transitions;
  
  -- Remove the column
  ALTER TABLE public.projects DROP COLUMN IF EXISTS unified_lifecycle_status;
  
  -- Drop the enum type
  DROP TYPE IF EXISTS public.project_lifecycle_status;
  
  -- Drop the migration function
  DROP FUNCTION IF EXISTS public.migrate_to_unified_lifecycle_status();
  
  RAISE NOTICE 'Unified lifecycle status migration has been rolled back';
END;
$$;

-- Create verification function to check migration success
CREATE OR REPLACE FUNCTION public.verify_unified_lifecycle_migration()
RETURNS TABLE(
  total_projects INTEGER,
  migrated_projects INTEGER,
  migration_complete BOOLEAN,
  status_distribution JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  total_count INTEGER;
  migrated_count INTEGER;
  status_dist JSONB;
BEGIN
  -- Count total projects
  SELECT COUNT(*) INTO total_count FROM public.projects;
  
  -- Count migrated projects (those with unified_lifecycle_status)
  SELECT COUNT(*) INTO migrated_count 
  FROM public.projects 
  WHERE unified_lifecycle_status IS NOT NULL;
  
  -- Get status distribution
  SELECT jsonb_object_agg(unified_lifecycle_status, count) INTO status_dist
  FROM (
    SELECT unified_lifecycle_status, COUNT(*) as count
    FROM public.projects
    WHERE unified_lifecycle_status IS NOT NULL
    GROUP BY unified_lifecycle_status
  ) dist;
  
  RETURN QUERY SELECT 
    total_count,
    migrated_count,
    (total_count = migrated_count) AS migration_complete,
    COALESCE(status_dist, '{}'::JSONB) AS status_distribution;
END;
$$;

-- Run verification and log results
DO $$
DECLARE
  verification RECORD;
BEGIN
  SELECT * INTO verification FROM public.verify_unified_lifecycle_migration() LIMIT 1;
  
  RAISE NOTICE 'Migration Verification Results:';
  RAISE NOTICE 'Total Projects: %', verification.total_projects;
  RAISE NOTICE 'Migrated Projects: %', verification.migrated_projects;
  RAISE NOTICE 'Migration Complete: %', verification.migration_complete;
  RAISE NOTICE 'Status Distribution: %', verification.status_distribution;
END;
$$;
