-- ============================================================================
-- Fix RLS Policy Recursion: Remove circular dependencies between tasks and task_stakeholder_assignments
-- Resolves infinite recursion errors by simplifying policies
-- ============================================================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Enhanced task view access" ON public.tasks;
DROP POLICY IF EXISTS "Enhanced task create access" ON public.tasks;
DROP POLICY IF EXISTS "Enhanced task update access" ON public.tasks;
DROP POLICY IF EXISTS "Enhanced task delete access" ON public.tasks;
DROP POLICY IF EXISTS "Enhanced task assignment view access" ON public.task_stakeholder_assignments;
DROP POLICY IF EXISTS "Enhanced task assignment manage access" ON public.task_stakeholder_assignments;

-- Create NON-RECURSIVE task policies (no references to task_stakeholder_assignments)
CREATE POLICY "Task view access" 
ON public.tasks 
FOR SELECT 
USING (
  -- Admin users can view all tasks
  public.is_admin() OR
  
  -- Company users can view tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id)) OR
  
  -- Direct assignees can view their tasks
  (auth.uid() IS NOT NULL AND assignee_id = auth.uid()) OR
  
  -- Stakeholders assigned via assigned_stakeholder_id can view their tasks
  (auth.uid() IS NOT NULL AND assigned_stakeholder_id IN (
    SELECT id FROM public.stakeholders 
    WHERE profile_id = auth.uid()
  ))
);

CREATE POLICY "Task create access" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  -- Admin users can create tasks in any project
  public.is_admin() OR
  
  -- Company users can create tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id))
);

CREATE POLICY "Task update access" 
ON public.tasks 
FOR UPDATE 
USING (
  -- Admin users can update all tasks
  public.is_admin() OR
  
  -- Company users can update tasks in projects they can access
  (public.is_approved_company_user() AND public.user_can_access_project(project_id)) OR
  
  -- Direct assignees can update their tasks
  (auth.uid() IS NOT NULL AND assignee_id = auth.uid()) OR
  
  -- Stakeholders assigned via assigned_stakeholder_id can update their tasks
  (auth.uid() IS NOT NULL AND assigned_stakeholder_id IN (
    SELECT id FROM public.stakeholders 
    WHERE profile_id = auth.uid()
  ))
);

CREATE POLICY "Task delete access" 
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

-- Create NON-RECURSIVE task_stakeholder_assignments policies (no references to tasks table)
CREATE POLICY "Task assignment view access" 
ON public.task_stakeholder_assignments 
FOR SELECT 
USING (
  -- Admin users can view all assignments
  public.is_admin() OR
  
  -- Company users can view all assignments (they have project access via other means)
  public.is_approved_company_user() OR
  
  -- Stakeholders can view their own assignments
  (auth.uid() IS NOT NULL AND stakeholder_id IN (
    SELECT id FROM public.stakeholders 
    WHERE profile_id = auth.uid()
  ))
);

CREATE POLICY "Task assignment manage access" 
ON public.task_stakeholder_assignments 
FOR ALL 
USING (
  -- Admin users can manage all assignments
  public.is_admin() OR
  
  -- Company users can manage assignments
  public.is_approved_company_user()
);

-- Add helpful comments
COMMENT ON POLICY "Task view access" ON public.tasks IS 
'Non-recursive policy: Admin access + company user project access + direct assignment access';

COMMENT ON POLICY "Task assignment view access" ON public.task_stakeholder_assignments IS 
'Non-recursive policy: Admin access + company user access + stakeholder self-access';

-- Verification query (run manually to test)
-- SELECT id, title, project_id FROM public.tasks LIMIT 5;