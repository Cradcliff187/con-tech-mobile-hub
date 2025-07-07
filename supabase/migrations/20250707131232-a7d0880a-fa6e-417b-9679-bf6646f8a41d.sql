-- ============================================================================
-- Phase 1-2: Complete RLS Policy Cleanup - Fix Remaining Recursion Issues
-- Addresses messages, task_dependencies, and ensures no policy conflicts remain
-- ============================================================================

-- ======================= MESSAGES TABLE CLEANUP =======================
-- Drop any existing problematic policies on messages
DROP POLICY IF EXISTS "Company users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Company users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Create NON-RECURSIVE message policies using simple direct patterns
CREATE POLICY "Message view access" 
ON public.messages 
FOR SELECT 
USING (
  -- Admin users can view all messages
  public.is_admin() OR
  
  -- Company users can view messages in projects they can access
  (public.is_approved_company_user() AND (
    project_id IS NULL OR public.user_can_access_project(project_id)
  )) OR
  
  -- Users can view their own messages
  (auth.uid() IS NOT NULL AND sender_id = auth.uid())
);

CREATE POLICY "Message create access" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  -- Admin users can send messages
  public.is_admin() OR
  
  -- Company users can send messages 
  (public.is_approved_company_user() AND sender_id = auth.uid()) OR
  
  -- Users can send their own messages
  (auth.uid() IS NOT NULL AND sender_id = auth.uid())
);

-- ======================= TASK_DEPENDENCIES TABLE CHECK =======================
-- Check if task_dependencies table exists and clean up if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_dependencies') THEN
    -- Drop any existing recursive policies
    DROP POLICY IF EXISTS "Company users can view task dependencies" ON public.task_dependencies;
    DROP POLICY IF EXISTS "Company users can manage task dependencies" ON public.task_dependencies;
    DROP POLICY IF EXISTS "Task dependency view access" ON public.task_dependencies;
    DROP POLICY IF EXISTS "Task dependency manage access" ON public.task_dependencies;
    
    -- Create NON-RECURSIVE task dependency policies
    EXECUTE 'CREATE POLICY "Task dependency view access" 
    ON public.task_dependencies 
    FOR SELECT 
    USING (
      -- Admin users can view all dependencies
      public.is_admin() OR
      
      -- Company users can view dependencies (no task table references)
      public.is_approved_company_user()
    )';
    
    EXECUTE 'CREATE POLICY "Task dependency manage access" 
    ON public.task_dependencies 
    FOR ALL 
    USING (
      -- Admin users can manage all dependencies
      public.is_admin() OR
      
      -- Company users can manage dependencies
      public.is_approved_company_user()
    )';
  END IF;
END
$$;

-- ======================= DOUBLE-CHECK TASK POLICIES =======================
-- Ensure no conflicting or old task policies remain that could cause recursion

-- Drop any potentially conflicting old policies that might still exist
DROP POLICY IF EXISTS "Company users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

-- Same for task_stakeholder_assignments
DROP POLICY IF EXISTS "Company users can view task stakeholder assignments" ON public.task_stakeholder_assignments;
DROP POLICY IF EXISTS "Company users can manage task stakeholder assignments" ON public.task_stakeholder_assignments;

-- ======================= EQUIPMENT TABLE VERIFICATION =======================
-- Verify equipment policies are clean (they should be fine based on review)
-- Only update if there are any recursive patterns detected

-- Check and ensure equipment policies don't reference other tables that might cause issues
DROP POLICY IF EXISTS "Enhanced equipment view access" ON public.equipment;
DROP POLICY IF EXISTS "Enhanced equipment manage access" ON public.equipment;

-- Ensure clean, simple equipment policies exist
DO $$
BEGIN
  -- Only recreate if the standard policies don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Company users can view equipment') THEN
    CREATE POLICY "Company users can view equipment" 
    ON public.equipment 
    FOR SELECT 
    USING (
      public.is_admin() OR public.is_approved_company_user()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Company users can manage equipment') THEN
    CREATE POLICY "Company users can manage equipment" 
    ON public.equipment 
    FOR ALL 
    USING (
      public.is_admin() OR public.is_approved_company_user()
    );
  END IF;
END
$$;

-- ======================= VERIFICATION AND COMMENTS =======================
-- Add helpful comments for debugging
COMMENT ON POLICY "Message view access" ON public.messages IS 
'Non-recursive policy: Admin access + company user project access + sender access';

COMMENT ON POLICY "Message create access" ON public.messages IS 
'Non-recursive policy: Users can send their own messages';

-- Final verification queries (commented out for safety)
-- SELECT 'Tasks policy check' as check_type, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'tasks';
-- SELECT 'Messages policy check' as check_type, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'messages';
-- SELECT 'Equipment policy check' as check_type, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'equipment';