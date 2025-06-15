
-- ============================================================================
-- COMPREHENSIVE DATABASE RLS POLICY RESET AND REBUILD (CORRECTED)
-- 
-- This migration fixes the policy conflict by ensuring ALL existing policies
-- are properly dropped before recreating them.
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING RLS POLICIES (COMPREHENSIVE LIST)
-- ============================================================================

-- Drop all profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved company users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Company users can manage profiles" ON public.profiles;

-- Drop all projects policies
DROP POLICY IF EXISTS "Users can view their assigned projects or if company user" ON public.projects;
DROP POLICY IF EXISTS "Approved company users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Company users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can view assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Approved company users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Company users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their assigned projects or if company user" ON public.projects;
DROP POLICY IF EXISTS "Approved company users can update any project" ON public.projects;
DROP POLICY IF EXISTS "Company users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Approved company users can delete any project" ON public.projects;
DROP POLICY IF EXISTS "Company users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they're involved in" ON public.projects;
DROP POLICY IF EXISTS "Project managers can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Drop all tasks policies
DROP POLICY IF EXISTS "Users can manage tasks in accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Company users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assigned users can view their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assigned users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them or they manage" ON public.tasks;
DROP POLICY IF EXISTS "Project managers can create tasks" ON public.tasks;

-- Drop all stakeholders policies
DROP POLICY IF EXISTS "Users can view their own stakeholder record" ON public.stakeholders;
DROP POLICY IF EXISTS "Users can view own stakeholder record" ON public.stakeholders;
DROP POLICY IF EXISTS "Approved company users can view all stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Company users can view all stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Approved company users can manage stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Company users can manage stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Users can view stakeholders in their projects" ON public.stakeholders;
DROP POLICY IF EXISTS "Project managers can manage stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Users can view their stakeholder profiles" ON public.stakeholders;

-- Drop all other table policies (comprehensive)
DROP POLICY IF EXISTS "Approved company users can view resource allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "Company users can view resource allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "Project managers and admins can manage resource allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "Company users can manage resource allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "Approved company users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Company users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Project managers and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Company users can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can view weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Authenticated users can view weather" ON public.weather_data;
DROP POLICY IF EXISTS "Approved company users can manage weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Company users can manage weather" ON public.weather_data;
DROP POLICY IF EXISTS "Users can view documents in accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Company users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Approved company users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Company users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Company users can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Approved company users can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Company users can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can view task updates for accessible projects" ON public.task_updates;
DROP POLICY IF EXISTS "Company users can view task updates" ON public.task_updates;
DROP POLICY IF EXISTS "Users can create task updates for accessible projects" ON public.task_updates;
DROP POLICY IF EXISTS "Company users can create task updates" ON public.task_updates;
DROP POLICY IF EXISTS "Users can view activity log in their projects" ON public.activity_log;
DROP POLICY IF EXISTS "Company users can view activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Company users can create activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Users can view task dependencies in their projects" ON public.task_dependencies;
DROP POLICY IF EXISTS "Company users can view task dependencies" ON public.task_dependencies;
DROP POLICY IF EXISTS "Company users can manage task dependencies" ON public.task_dependencies;
DROP POLICY IF EXISTS "Users can view messages in their projects" ON public.messages;
DROP POLICY IF EXISTS "Company users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their projects" ON public.messages;
DROP POLICY IF EXISTS "Company users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view accessible task updates" ON public.task_updates;
DROP POLICY IF EXISTS "Users can update own task updates or admins can update any" ON public.task_updates;
DROP POLICY IF EXISTS "Users can delete own task updates or admins can delete any" ON public.task_updates;
DROP POLICY IF EXISTS "Users can view documents in their projects" ON public.documents;
DROP POLICY IF EXISTS "Users can view equipment in their projects" ON public.equipment;
DROP POLICY IF EXISTS "Stakeholders can view their assignments" ON public.stakeholder_assignments;
DROP POLICY IF EXISTS "Company users can view stakeholder assignments" ON public.stakeholder_assignments;
DROP POLICY IF EXISTS "Company users can manage stakeholder assignments" ON public.stakeholder_assignments;
DROP POLICY IF EXISTS "Approved company users can view stakeholder certifications" ON public.stakeholder_certifications;
DROP POLICY IF EXISTS "Company users can view stakeholder certifications" ON public.stakeholder_certifications;
DROP POLICY IF EXISTS "Company users can manage stakeholder certifications" ON public.stakeholder_certifications;
DROP POLICY IF EXISTS "Users can view certifications for accessible stakeholders" ON public.stakeholder_certifications;
DROP POLICY IF EXISTS "Users can view assignments in their projects" ON public.stakeholder_assignments;
DROP POLICY IF EXISTS "Users can view stakeholder availability for their projects" ON public.stakeholder_availability;
DROP POLICY IF EXISTS "Company users can view stakeholder availability" ON public.stakeholder_availability;
DROP POLICY IF EXISTS "Company users can manage stakeholder availability" ON public.stakeholder_availability;
DROP POLICY IF EXISTS "Users can view performance for accessible stakeholders" ON public.stakeholder_performance;
DROP POLICY IF EXISTS "Company users can view stakeholder performance" ON public.stakeholder_performance;
DROP POLICY IF EXISTS "Company users can manage stakeholder performance" ON public.stakeholder_performance;
DROP POLICY IF EXISTS "Company users can view invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Company users can create invitations" ON public.user_invitations;

-- ============================================================================
-- STEP 2: RECREATE SIMPLE, NON-RECURSIVE HELPER FUNCTIONS
-- ============================================================================

-- Simple function to check if user is approved company user (direct query)
CREATE OR REPLACE FUNCTION public.is_approved_company_user()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  );
$$;

-- Simple function to check if user is admin (direct query)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved' 
      AND role = 'admin'
  );
$$;

-- Simple function to check if user is project manager or admin (direct query)
CREATE OR REPLACE FUNCTION public.is_project_manager_or_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved' 
      AND role IN ('admin', 'project_manager')
  );
$$;

-- ============================================================================
-- STEP 3: CREATE SIMPLE, DIRECT RLS POLICIES
-- ============================================================================

-- PROFILES TABLE: Simple self-access only
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- PROJECTS TABLE: Direct checks without function calls
CREATE POLICY "Company users can view all projects" 
ON public.projects FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can create projects" 
ON public.projects FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can update projects" 
ON public.projects FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can delete projects" 
ON public.projects FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- TASKS TABLE: Simple project-based access
CREATE POLICY "Company users can view all tasks" 
ON public.tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can create tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can update tasks" 
ON public.tasks FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can delete tasks" 
ON public.tasks FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- STAKEHOLDERS TABLE: Simple ownership and company access
CREATE POLICY "Company users can view all stakeholders" 
ON public.stakeholders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage stakeholders" 
ON public.stakeholders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- ACTIVITY LOG: Simple access for company users
CREATE POLICY "Company users can view activity log" 
ON public.activity_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can create activity log" 
ON public.activity_log FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- DOCUMENTS: Simple access
CREATE POLICY "Company users can view documents" 
ON public.documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage documents" 
ON public.documents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- EQUIPMENT: Simple access
CREATE POLICY "Company users can view equipment" 
ON public.equipment FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage equipment" 
ON public.equipment FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- WEATHER DATA: Simple access
CREATE POLICY "Authenticated users can view weather" 
ON public.weather_data FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Company users can manage weather" 
ON public.weather_data FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- RESOURCE ALLOCATIONS: Simple access
CREATE POLICY "Company users can view resource allocations" 
ON public.resource_allocations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage resource allocations" 
ON public.resource_allocations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- TEAM MEMBERS: Simple access
CREATE POLICY "Company users can view team members" 
ON public.team_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage team members" 
ON public.team_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- TASK UPDATES: Simple access
CREATE POLICY "Company users can view task updates" 
ON public.task_updates FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can create task updates" 
ON public.task_updates FOR INSERT 
WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- MESSAGES: Simple access
CREATE POLICY "Company users can view messages" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- TASK DEPENDENCIES: Simple access
CREATE POLICY "Company users can view task dependencies" 
ON public.task_dependencies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage task dependencies" 
ON public.task_dependencies FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- USER INVITATIONS: Simple access
CREATE POLICY "Company users can view invitations" 
ON public.user_invitations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can create invitations" 
ON public.user_invitations FOR INSERT 
WITH CHECK (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- STAKEHOLDER RELATED TABLES: Simple access
CREATE POLICY "Company users can view stakeholder assignments" 
ON public.stakeholder_assignments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage stakeholder assignments" 
ON public.stakeholder_assignments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can view stakeholder certifications" 
ON public.stakeholder_certifications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage stakeholder certifications" 
ON public.stakeholder_certifications FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can view stakeholder availability" 
ON public.stakeholder_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage stakeholder availability" 
ON public.stakeholder_availability FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can view stakeholder performance" 
ON public.stakeholder_performance FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage stakeholder performance" 
ON public.stakeholder_performance FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND is_company_user = true 
      AND account_status = 'approved'
  )
);

-- ============================================================================
-- This migration should completely resolve the infinite recursion errors
-- by using simple, direct policies that avoid any recursive references.
-- ============================================================================
