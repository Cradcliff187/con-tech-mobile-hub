
-- RLS Error Resolution Migration for AKC Construction Management
-- This migration fixes RLS policy issues for team_members, weather_data, resource_allocations, and task_updates tables

-- Enable RLS on all affected tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TEAM_MEMBERS TABLE POLICIES
-- ============================================================================

-- AKC company users can view all team members
CREATE POLICY "AKC users can view team members"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- AKC company users with admin/project_manager role can manage team members
CREATE POLICY "AKC managers can manage team members"
  ON public.team_members FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
      AND pr.role IN ('admin', 'project_manager')
    )
  );

-- ============================================================================
-- WEATHER_DATA TABLE POLICIES
-- ============================================================================

-- Public read access for weather data (all authenticated users)
CREATE POLICY "All users can view weather data"
  ON public.weather_data FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only AKC company users can manage weather data
CREATE POLICY "AKC users can manage weather data"
  ON public.weather_data FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

CREATE POLICY "AKC users can update weather data"
  ON public.weather_data FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

CREATE POLICY "AKC users can delete weather data"
  ON public.weather_data FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- ============================================================================
-- RESOURCE_ALLOCATIONS TABLE POLICIES
-- ============================================================================

-- AKC company users can view resource allocations
CREATE POLICY "AKC users can view resource allocations"
  ON public.resource_allocations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- AKC company users with admin/project_manager role can manage resource allocations
CREATE POLICY "AKC managers can manage resource allocations"
  ON public.resource_allocations FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
      AND pr.role IN ('admin', 'project_manager')
    )
  );

-- ============================================================================
-- TASK_UPDATES TABLE POLICIES
-- ============================================================================

-- Users can view task updates for projects they have access to
CREATE POLICY "Users can view accessible task updates"
  ON public.task_updates FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(
      (SELECT project_id FROM public.tasks WHERE id = task_id)
    )
  );

-- Users can create task updates for projects they have access to
CREATE POLICY "Users can create task updates for accessible projects"
  ON public.task_updates FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(
      (SELECT project_id FROM public.tasks WHERE id = task_id)
    )
  );

-- Users can update their own task updates, or AKC admins can update any
CREATE POLICY "Users can update own task updates or admins can update any"
  ON public.task_updates FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
        AND pr.role = 'admin'
      )
    )
  );

-- Users can delete their own task updates, or AKC admins can delete any
CREATE POLICY "Users can delete own task updates or admins can delete any"
  ON public.task_updates FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
        AND pr.role = 'admin'
      )
    )
  );

-- Add helpful indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_stakeholder_id ON public.team_members(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project_id ON public.resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_author_id ON public.task_updates(author_id);

-- Add comments for documentation
COMMENT ON TABLE public.team_members IS 'AKC project team member allocations with RLS for company users';
COMMENT ON TABLE public.weather_data IS 'Weather information for AKC project sites with public read access';
COMMENT ON TABLE public.resource_allocations IS 'AKC project resource management with admin/manager access control';
COMMENT ON TABLE public.task_updates IS 'Task progress updates with project-based access control';
