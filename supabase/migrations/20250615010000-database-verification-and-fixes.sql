
-- Database Schema Verification and Fixes
-- This migration ensures all tables have proper RLS policies and foreign key relationships

-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

-- Add missing foreign key constraints
ALTER TABLE public.resource_allocations 
ADD CONSTRAINT resource_allocations_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_allocation_id_fkey 
FOREIGN KEY (allocation_id) REFERENCES public.resource_allocations(id) ON DELETE CASCADE;

ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_stakeholder_id_fkey 
FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE;

ALTER TABLE public.task_updates 
ADD CONSTRAINT task_updates_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

ALTER TABLE public.task_updates 
ADD CONSTRAINT task_updates_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add missing RLS policies for new tables

-- Resource Allocations Policies
CREATE POLICY "Company users can view resource allocations"
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

CREATE POLICY "Company users can manage resource allocations"
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

-- Team Members Policies
CREATE POLICY "Company users can view team members"
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

CREATE POLICY "Company users can manage team members"
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

-- Task Updates Policies
CREATE POLICY "Users can view task updates for accessible tasks"
  ON public.task_updates FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(
      (SELECT project_id FROM public.tasks WHERE id = task_id)
    )
  );

CREATE POLICY "Users can create task updates for accessible tasks"
  ON public.task_updates FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(
      (SELECT project_id FROM public.tasks WHERE id = task_id)
    )
  );

-- Weather Data Policies (public read access)
CREATE POLICY "Anyone can view weather data"
  ON public.weather_data FOR SELECT
  USING (true);

CREATE POLICY "Company users can manage weather data"
  ON public.weather_data FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- Fix existing RLS policies that might have circular references

-- Drop and recreate profiles policies to avoid issues
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Company users can manage profiles"
  ON public.profiles FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
      AND pr.role = 'admin'
    )
  );

-- Ensure all standard RLS policies exist for main tables

-- Documents policies
DROP POLICY IF EXISTS "Users can view documents in their projects" ON public.documents;
CREATE POLICY "Users can view documents in accessible projects"
  ON public.documents FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(project_id)
  );

CREATE POLICY "Company users can manage documents"
  ON public.documents FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their projects" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their projects" ON public.messages;

CREATE POLICY "Users can view messages in accessible projects"
  ON public.messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(project_id)
  );

CREATE POLICY "Users can create messages in accessible projects"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    sender_id = auth.uid() AND
    public.user_can_access_project(project_id)
  );

-- Equipment policies
DROP POLICY IF EXISTS "Users can view equipment in their projects" ON public.equipment;
CREATE POLICY "Users can view equipment in accessible projects"
  ON public.equipment FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      project_id IS NULL OR
      public.user_can_access_project(project_id)
    )
  );

CREATE POLICY "Company users can manage equipment"
  ON public.equipment FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );

-- Activity log policies
DROP POLICY IF EXISTS "Users can view activity log in their projects" ON public.activity_log;
CREATE POLICY "Users can view activity in accessible projects"
  ON public.activity_log FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.user_can_access_project(project_id)
  );

CREATE POLICY "Users can create activity logs"
  ON public.activity_log FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid() AND
    public.user_can_access_project(project_id)
  );

-- Verify all required indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_status ON public.profiles(is_company_user, account_status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stakeholder ON public.tasks(assigned_stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_messages_project ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON public.equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON public.activity_log(project_id);
