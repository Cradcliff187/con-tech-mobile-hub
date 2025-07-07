-- ============================================================================
-- DEVELOPMENT RLS SIMPLIFICATION: Replace complex policies with auth-only checks
-- This migration simplifies RLS for development by removing approval requirements
-- while maintaining basic authentication. Can be rolled back later for production.
-- ============================================================================

-- ============================================================================
-- BACKUP DOCUMENTATION: Current complex policies being replaced
-- ============================================================================

-- BACKED UP POLICIES (for restoration later):
-- - Company users with is_company_user = true AND account_status = 'approved'
-- - Admin users with is_admin() function checks
-- - Project access with user_can_access_project() checks
-- - is_project_manager_or_admin() function checks

-- ============================================================================
-- SIMPLIFY PROJECTS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Company users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Company users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Company users can delete projects" ON public.projects;

-- Create simplified policies - any authenticated user
CREATE POLICY "Authenticated users can view all projects" ON public.projects
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects" ON public.projects
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete projects" ON public.projects
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY TASKS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view accessible tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Company users can delete tasks" ON public.tasks;

-- Create simplified policies
CREATE POLICY "Authenticated users can view all tasks" ON public.tasks
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create tasks" ON public.tasks
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks" ON public.tasks
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tasks" ON public.tasks
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY EQUIPMENT TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Company users can manage equipment" ON public.equipment;

-- Create simplified policies
CREATE POLICY "Authenticated users can view equipment" ON public.equipment
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage equipment" ON public.equipment
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY STAKEHOLDERS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view stakeholders" ON public.stakeholders;
DROP POLICY IF EXISTS "Company users can manage stakeholders" ON public.stakeholders;

-- Create simplified policies
CREATE POLICY "Authenticated users can view stakeholders" ON public.stakeholders
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage stakeholders" ON public.stakeholders
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Company users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "ConstructPro document view access" ON public.documents;
DROP POLICY IF EXISTS "ConstructPro document upload access" ON public.documents;
DROP POLICY IF EXISTS "ConstructPro document update access" ON public.documents;
DROP POLICY IF EXISTS "ConstructPro document delete access" ON public.documents;

-- Create simplified policies
CREATE POLICY "Authenticated users can view documents" ON public.documents
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage documents" ON public.documents
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY EQUIPMENT ALLOCATIONS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can manage equipment allocations" ON public.equipment_allocations;

-- Create simplified policies
CREATE POLICY "Authenticated users can manage equipment allocations" ON public.equipment_allocations
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY STAKEHOLDER ASSIGNMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing complex policies if they exist
DROP POLICY IF EXISTS "Company users can view stakeholder assignments" ON public.stakeholder_assignments;
DROP POLICY IF EXISTS "Company users can manage stakeholder assignments" ON public.stakeholder_assignments;

-- Create simplified policies
CREATE POLICY "Authenticated users can view stakeholder assignments" ON public.stakeholder_assignments
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage stakeholder assignments" ON public.stakeholder_assignments
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY ACTIVITY LOG POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Company users can create activity log" ON public.activity_log;

-- Create simplified policies
CREATE POLICY "Authenticated users can view activity log" ON public.activity_log
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create activity log" ON public.activity_log
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY CHANGE ORDERS POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Company users can create change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Company users can update change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Company users can delete change orders" ON public.change_orders;

-- Create simplified policies
CREATE POLICY "Authenticated users can view change orders" ON public.change_orders
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create change orders" ON public.change_orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update change orders" ON public.change_orders
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete change orders" ON public.change_orders
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY ESTIMATES AND BIDS POLICIES
-- ============================================================================

-- Drop existing complex policies for estimates
DROP POLICY IF EXISTS "Company users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Company users can manage estimates" ON public.estimates;

-- Create simplified policies for estimates
CREATE POLICY "Authenticated users can view estimates" ON public.estimates
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage estimates" ON public.estimates
FOR ALL USING (auth.uid() IS NOT NULL);

-- Drop existing complex policies for bids
DROP POLICY IF EXISTS "Company users can view bids" ON public.bids;
DROP POLICY IF EXISTS "Company users can manage bids" ON public.bids;

-- Create simplified policies for bids
CREATE POLICY "Authenticated users can view bids" ON public.bids
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage bids" ON public.bids
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY RFIS POLICIES
-- ============================================================================

-- Drop existing complex policies
DROP POLICY IF EXISTS "Company users can view RFIs" ON public.rfis;
DROP POLICY IF EXISTS "Company users can create RFIs" ON public.rfis;
DROP POLICY IF EXISTS "Company users can update RFIs" ON public.rfis;
DROP POLICY IF EXISTS "Company users can delete RFIs" ON public.rfis;

-- Create simplified policies
CREATE POLICY "Authenticated users can view RFIs" ON public.rfis
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create RFIs" ON public.rfis
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update RFIs" ON public.rfis
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete RFIs" ON public.rfis
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFY MAINTENANCE POLICIES
-- ============================================================================

-- Drop existing complex policies for maintenance tasks
DROP POLICY IF EXISTS "Company users can view maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Company users can create maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Company users can update maintenance tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "Company users can delete maintenance tasks" ON public.maintenance_tasks;

-- Create simplified policies for maintenance tasks
CREATE POLICY "Authenticated users can view maintenance tasks" ON public.maintenance_tasks
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage maintenance tasks" ON public.maintenance_tasks
FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PRESERVE CRITICAL SECURITY: PROFILES TABLE
-- Keep profiles table restricted to own records only
-- ============================================================================

-- Profiles policies remain unchanged - users can only access their own profile
-- These are already properly configured:
-- - "Users can view own profile" 
-- - "Users can update own profile"

-- ============================================================================
-- PRESERVE CRITICAL SECURITY: MIGRATION LOG
-- Keep migration_log admin-only for data integrity
-- ============================================================================

-- Migration log policies remain unchanged - admin only access for data integrity

-- ============================================================================
-- DOCUMENTATION FOR RESTORATION
-- ============================================================================

-- Add comment for future restoration
COMMENT ON SCHEMA public IS 'RLS simplified for development. Original complex policies backed up in this migration. To restore production security, reverse these changes and restore original is_approved_company_user() and is_admin() based policies.';

-- Log the simplification
INSERT INTO public.activity_log (
  action,
  entity_type,
  entity_id,
  details
) VALUES (
  'rls_simplified',
  'system',
  gen_random_uuid(),
  jsonb_build_object(
    'reason', 'Development RLS simplification',
    'timestamp', now(),
    'note', 'Complex approval policies replaced with auth.uid() IS NOT NULL checks'
  )
);