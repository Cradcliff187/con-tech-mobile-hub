
-- Phase 1: Database Schema Evolution - Add unified lifecycle_status (Fixed)
-- This migration adds the new lifecycle_status column and populates it based on existing status/phase data

-- Create the new lifecycle_status enum
CREATE TYPE public.lifecycle_status AS ENUM (
  'pre_planning',
  'planning_active', 
  'construction_active',
  'construction_hold',
  'punch_list_phase',
  'project_closeout',
  'project_completed',
  'project_cancelled'
);

-- Add the new lifecycle_status column to projects table
ALTER TABLE public.projects 
ADD COLUMN lifecycle_status public.lifecycle_status;

-- Create a function to migrate existing status/phase combinations to lifecycle_status
CREATE OR REPLACE FUNCTION public.migrate_to_lifecycle_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update lifecycle_status based on current status and phase combinations
  UPDATE public.projects SET lifecycle_status = CASE
    -- Cancelled projects always map to project_cancelled
    WHEN status = 'cancelled' THEN 'project_cancelled'::public.lifecycle_status
    
    -- Planning status projects
    WHEN status = 'planning' AND (phase IS NULL OR phase = 'planning') THEN 'pre_planning'::public.lifecycle_status
    WHEN status = 'planning' AND phase = 'active' THEN 'planning_active'::public.lifecycle_status
    
    -- Active status projects  
    WHEN status = 'active' AND (phase IS NULL OR phase = 'planning') THEN 'planning_active'::public.lifecycle_status
    WHEN status = 'active' AND phase = 'active' THEN 'construction_active'::public.lifecycle_status
    WHEN status = 'active' AND phase = 'punch_list' THEN 'punch_list_phase'::public.lifecycle_status
    WHEN status = 'active' AND phase = 'closeout' THEN 'project_closeout'::public.lifecycle_status
    WHEN status = 'active' AND phase = 'completed' THEN 'project_completed'::public.lifecycle_status
    
    -- On-hold projects
    WHEN status = 'on-hold' THEN 'construction_hold'::public.lifecycle_status
    
    -- Completed projects
    WHEN status = 'completed' THEN 'project_completed'::public.lifecycle_status
    
    -- Default fallback based on status only
    WHEN status = 'planning' THEN 'pre_planning'::public.lifecycle_status
    WHEN status = 'active' THEN 'construction_active'::public.lifecycle_status
    
    -- Final fallback
    ELSE 'pre_planning'::public.lifecycle_status
  END
  WHERE lifecycle_status IS NULL;
END;
$$;

-- Run the migration function
SELECT public.migrate_to_lifecycle_status();

-- Add a trigger to keep lifecycle_status in sync when status/phase change (for backward compatibility)
CREATE OR REPLACE FUNCTION public.sync_lifecycle_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if lifecycle_status is null or if we're explicitly syncing
  IF NEW.lifecycle_status IS NULL OR (OLD.status != NEW.status OR OLD.phase != NEW.phase) THEN
    NEW.lifecycle_status := CASE
      WHEN NEW.status = 'cancelled' THEN 'project_cancelled'::public.lifecycle_status
      WHEN NEW.status = 'planning' AND (NEW.phase IS NULL OR NEW.phase = 'planning') THEN 'pre_planning'::public.lifecycle_status
      WHEN NEW.status = 'planning' AND NEW.phase = 'active' THEN 'planning_active'::public.lifecycle_status
      WHEN NEW.status = 'active' AND (NEW.phase IS NULL OR NEW.phase = 'planning') THEN 'planning_active'::public.lifecycle_status
      WHEN NEW.status = 'active' AND NEW.phase = 'active' THEN 'construction_active'::public.lifecycle_status
      WHEN NEW.status = 'active' AND NEW.phase = 'punch_list' THEN 'punch_list_phase'::public.lifecycle_status
      WHEN NEW.status = 'active' AND NEW.phase = 'closeout' THEN 'project_closeout'::public.lifecycle_status
      WHEN NEW.status = 'active' AND NEW.phase = 'completed' THEN 'project_completed'::public.lifecycle_status
      WHEN NEW.status = 'on-hold' THEN 'construction_hold'::public.lifecycle_status
      WHEN NEW.status = 'completed' THEN 'project_completed'::public.lifecycle_status
      WHEN NEW.status = 'planning' THEN 'pre_planning'::public.lifecycle_status
      WHEN NEW.status = 'active' THEN 'construction_active'::public.lifecycle_status
      ELSE 'pre_planning'::public.lifecycle_status
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_lifecycle_status_trigger ON public.projects;
CREATE TRIGGER sync_lifecycle_status_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lifecycle_status();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_projects_lifecycle_status ON public.projects(lifecycle_status);

-- Add a validation function to ensure data consistency
CREATE OR REPLACE FUNCTION public.validate_project_status_consistency()
RETURNS TABLE(project_id uuid, project_name text, current_status text, current_phase text, lifecycle_status text, suggested_lifecycle_status text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.status::text,
    p.phase,
    p.lifecycle_status::text,
    CASE
      WHEN p.status = 'cancelled' THEN 'project_cancelled'
      WHEN p.status = 'planning' AND (p.phase IS NULL OR p.phase = 'planning') THEN 'pre_planning'
      WHEN p.status = 'planning' AND p.phase = 'active' THEN 'planning_active'
      WHEN p.status = 'active' AND (p.phase IS NULL OR p.phase = 'planning') THEN 'planning_active'
      WHEN p.status = 'active' AND p.phase = 'active' THEN 'construction_active'
      WHEN p.status = 'active' AND p.phase = 'punch_list' THEN 'punch_list_phase'
      WHEN p.status = 'active' AND p.phase = 'closeout' THEN 'project_closeout'
      WHEN p.status = 'active' AND p.phase = 'completed' THEN 'project_completed'
      WHEN p.status = 'on-hold' THEN 'construction_hold'
      WHEN p.status = 'completed' THEN 'project_completed'
      ELSE 'pre_planning'
    END as suggested_lifecycle_status
  FROM public.projects p
  WHERE p.lifecycle_status::text != CASE
    WHEN p.status = 'cancelled' THEN 'project_cancelled'
    WHEN p.status = 'planning' AND (p.phase IS NULL OR p.phase = 'planning') THEN 'pre_planning'
    WHEN p.status = 'planning' AND p.phase = 'active' THEN 'planning_active'
    WHEN p.status = 'active' AND (p.phase IS NULL OR p.phase = 'planning') THEN 'planning_active'
    WHEN p.status = 'active' AND p.phase = 'active' THEN 'construction_active'
    WHEN p.status = 'active' AND p.phase = 'punch_list' THEN 'punch_list_phase'
    WHEN p.status = 'active' AND p.phase = 'closeout' THEN 'project_closeout'
    WHEN p.status = 'active' AND p.phase = 'completed' THEN 'project_completed'
    WHEN p.status = 'on-hold' THEN 'construction_hold'
    WHEN p.status = 'completed' THEN 'project_completed'
    ELSE 'pre_planning'
  END;
END;
$$;
