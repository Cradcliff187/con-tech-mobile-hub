
-- Critical Construction App Updates Migration
-- Priority 1: Fix Schema Conflicts & Priority 2: Resource Management Enhancement

-- 1. Fix team_members table relationship conflict
ALTER TABLE public.team_members 
DROP CONSTRAINT IF EXISTS team_members_stakeholder_id_fkey;

-- Add user_id to link team_members to profiles table
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS date date; -- for daily allocations

-- 2. Enhance resource allocation for daily tracking
ALTER TABLE public.resource_allocations
ADD COLUMN IF NOT EXISTS allocation_type text DEFAULT 'weekly' CHECK (allocation_type IN ('weekly', 'daily'));

-- 3. Add skills to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- 4. Add task enhancements for punch list and skills
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'regular' CHECK (task_type IN ('regular', 'punch_list')),
ADD COLUMN IF NOT EXISTS required_skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS punch_list_category text CHECK (punch_list_category IN ('paint', 'electrical', 'plumbing', 'carpentry', 'flooring', 'hvac', 'other'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_date ON public.team_members(date);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_punch_list_category ON public.tasks(punch_list_category);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_type ON public.resource_allocations(allocation_type);

-- Create function to check for resource conflicts
CREATE OR REPLACE FUNCTION public.check_resource_conflicts(
  p_user_id uuid,
  p_date date,
  p_hours integer DEFAULT 8
)
RETURNS TABLE (
  conflict_type text,
  conflicting_allocation_id uuid,
  conflicting_team_name text,
  allocated_hours integer,
  available_hours integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'schedule_conflict'::text as conflict_type,
    ra.id as conflicting_allocation_id,
    ra.team_name,
    tm.hours_allocated,
    (8 - COALESCE(SUM(tm2.hours_allocated), 0))::integer as available_hours
  FROM public.resource_allocations ra
  JOIN public.team_members tm ON tm.allocation_id = ra.id
  LEFT JOIN public.team_members tm2 ON tm2.user_id = p_user_id AND tm2.date = p_date
  WHERE tm.user_id = p_user_id 
    AND (
      (ra.allocation_type = 'daily' AND tm.date = p_date) OR
      (ra.allocation_type = 'weekly' AND p_date >= ra.week_start_date AND p_date < ra.week_start_date + INTERVAL '7 days')
    )
  GROUP BY ra.id, ra.team_name, tm.hours_allocated
  HAVING (COALESCE(SUM(tm2.hours_allocated), 0) + p_hours) > 8;
END;
$$;

-- Add RLS policies for new columns
-- (RLS is already enabled on existing tables, so we just need policies for new functionality)

-- Policy for team_members user_id access
DROP POLICY IF EXISTS "Company users can manage team members" ON public.team_members;
CREATE POLICY "Company users can manage team members" ON public.team_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_company_user = true 
    AND profiles.account_status = 'approved'
  )
);

-- Update updated_at triggers for modified tables
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Rollback commands (for reference):
-- ALTER TABLE public.team_members DROP COLUMN IF EXISTS user_id, DROP COLUMN IF EXISTS date;
-- ALTER TABLE public.resource_allocations DROP COLUMN IF EXISTS allocation_type;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS skills;
-- ALTER TABLE public.tasks DROP COLUMN IF EXISTS task_type, DROP COLUMN IF EXISTS required_skills, DROP COLUMN IF EXISTS punch_list_category;
-- DROP FUNCTION IF EXISTS public.check_resource_conflicts(uuid, date, integer);
