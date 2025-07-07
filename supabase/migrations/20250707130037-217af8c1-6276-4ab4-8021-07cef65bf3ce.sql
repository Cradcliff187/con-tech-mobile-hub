-- ============================================================================
-- Fix Task RLS Policies: Comprehensive Task Access Control with Admin Bypass
-- Resolves "You don't have permission to assign tasks" for admin users
-- ============================================================================

-- Drop existing restrictive task policies
DROP POLICY IF EXISTS "Company users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

-- Create comprehensive task RLS policies with admin bypass and project access
-- SELECT: Admin users + project access + assigned stakeholders
CREATE POLICY "Enhanced task view access" 
ON public.tasks 
FOR SELECT 
USING (
  -- Admin users can view all tasks
  public.is_admin() OR
  
  -- Company users can view tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id)) OR
  
  -- External stakeholders can view tasks assigned to them
  (auth.uid() IS NOT NULL AND (
    assignee_id = auth.uid() OR
    assigned_stakeholder_id IN (
      SELECT id FROM public.stakeholders 
      WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.task_stakeholder_assignments tsa
      JOIN public.stakeholders s ON tsa.stakeholder_id = s.id
      WHERE tsa.task_id = tasks.id 
      AND s.profile_id = auth.uid()
      AND tsa.status = 'active'
    )
  ))
);

-- INSERT: Admin users + project access for company users
CREATE POLICY "Enhanced task create access" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  -- Admin users can create tasks in any project
  public.is_admin() OR
  
  -- Company users can create tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id))
);

-- UPDATE: Admin users + project access + task ownership
CREATE POLICY "Enhanced task update access" 
ON public.tasks 
FOR UPDATE 
USING (
  -- Admin users can update all tasks
  public.is_admin() OR
  
  -- Company users can update tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id)) OR
  
  -- Task assignees can update their own tasks (limited fields)
  (auth.uid() IS NOT NULL AND assignee_id = auth.uid()) OR
  
  -- Assigned stakeholders can update their tasks
  (auth.uid() IS NOT NULL AND assigned_stakeholder_id IN (
    SELECT id FROM public.stakeholders 
    WHERE profile_id = auth.uid()
  )) OR
  
  -- Multi-assigned stakeholders can update their tasks
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.task_stakeholder_assignments tsa
    JOIN public.stakeholders s ON tsa.stakeholder_id = s.id
    WHERE tsa.task_id = tasks.id 
    AND s.profile_id = auth.uid()
    AND tsa.status = 'active'
  ))
);

-- DELETE: Admin users + project managers only
CREATE POLICY "Enhanced task delete access" 
ON public.tasks 
FOR DELETE 
USING (
  -- Admin users can delete all tasks
  public.is_admin() OR
  
  -- Project managers can delete tasks in their projects
  (public.is_approved_company_user() AND 
   public.user_can_access_project(project_id) AND
   EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE id = auth.uid() 
     AND role IN ('admin', 'project_manager')
   ))
);

-- Drop and recreate task_stakeholder_assignments policies for consistency
DROP POLICY IF EXISTS "Company users can view task stakeholder assignments" ON public.task_stakeholder_assignments;
DROP POLICY IF EXISTS "Company users can manage task stakeholder assignments" ON public.task_stakeholder_assignments;

-- Enhanced policies for task_stakeholder_assignments
CREATE POLICY "Enhanced task assignment view access" 
ON public.task_stakeholder_assignments 
FOR SELECT 
USING (
  -- Admin users can view all assignments
  public.is_admin() OR
  
  -- Company users can view assignments for accessible projects
  (public.is_approved_company_user() AND EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND public.user_can_access_project(t.project_id)
  )) OR
  
  -- Stakeholders can view their own assignments
  (auth.uid() IS NOT NULL AND stakeholder_id IN (
    SELECT id FROM public.stakeholders 
    WHERE profile_id = auth.uid()
  ))
);

CREATE POLICY "Enhanced task assignment manage access" 
ON public.task_stakeholder_assignments 
FOR ALL 
USING (
  -- Admin users can manage all assignments
  public.is_admin() OR
  
  -- Company users can manage assignments for accessible projects
  (public.is_approved_company_user() AND EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id 
    AND public.user_can_access_project(t.project_id)
  ))
);

-- Add helpful comments for debugging
COMMENT ON POLICY "Enhanced task view access" ON public.tasks IS 
'Allows admin users full access, company users project-based access, and stakeholders access to assigned tasks';

COMMENT ON POLICY "Enhanced task update access" ON public.tasks IS 
'Allows admin users and project-access company users to update tasks, plus assignees can update their own tasks';

COMMENT ON POLICY "Enhanced task delete access" ON public.tasks IS 
'Restricts deletion to admin users and project managers with project access';

-- Test verification queries (run manually to verify)
-- To test admin access (should return true for admin users):
-- SELECT public.is_admin() as admin_check;

-- To test project access (should work for accessible projects):
-- SELECT public.user_can_access_project('<project_id>') as project_access;

-- To test task query access (should work based on policies above):
-- SELECT id, title, project_id FROM public.tasks LIMIT 5;