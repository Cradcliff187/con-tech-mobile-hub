
-- ============================================================================
-- Step 1 (Corrected): Foundational Schema Updates
-- This script implements the requested changes using a trigger for skill matching.
-- ============================================================================

-- Add project lifecycle phase tracking to the 'projects' table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS phase text DEFAULT 'planning' CHECK (phase IN ('planning', 'active', 'punch_list', 'closeout', 'completed'));

-- Add a foreign key constraint from 'tasks' to 'projects' for data integrity
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Simplify 'team_members' by removing the redundant 'stakeholder_id'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'stakeholder_id') THEN
    ALTER TABLE public.team_members DROP COLUMN stakeholder_id;
  END IF;
END $$;

-- Add punch list metadata to the 'tasks' table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS converted_from_task_id uuid REFERENCES tasks(id),
ADD COLUMN IF NOT EXISTS inspection_status text CHECK (inspection_status IN ('pending', 'passed', 'failed', 'na'));

-- Create 'project_stakeholders' junction table
CREATE TABLE IF NOT EXISTS public.project_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stakeholder_id uuid NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, stakeholder_id)
);

-- Add RLS to the new junction table
ALTER TABLE public.project_stakeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company users can manage project stakeholders" ON public.project_stakeholders;
CREATE POLICY "Company users can manage project stakeholders"
ON public.project_stakeholders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_company_user = true
      AND account_status = 'approved'
  )
);

-- ============================================================================
-- FIX: Replace Generated Column with a Trigger-based approach
-- ============================================================================

-- 1. Remove the old generated column if it exists, and add a simple boolean column
ALTER TABLE public.tasks DROP COLUMN IF EXISTS matches_skills;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS matches_skills boolean DEFAULT false;

-- 2. Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.update_task_skill_match()
RETURNS TRIGGER AS $$
DECLARE
  assignee_skills text[];
BEGIN
  IF NEW.assignee_id IS NULL THEN
    NEW.matches_skills := false;
    RETURN NEW;
  END IF;
  
  IF NEW.required_skills IS NULL OR cardinality(NEW.required_skills) = 0 THEN
    NEW.matches_skills := true;
    RETURN NEW;
  END IF;

  SELECT skills INTO assignee_skills FROM public.profiles WHERE id = NEW.assignee_id;
  
  NEW.matches_skills := COALESCE(assignee_skills, '{}'::text[]) && NEW.required_skills;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger to automatically update 'matches_skills'
DROP TRIGGER IF EXISTS set_task_skill_match_trigger ON public.tasks;
CREATE TRIGGER set_task_skill_match_trigger
BEFORE INSERT OR UPDATE OF assignee_id, required_skills ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_task_skill_match();

