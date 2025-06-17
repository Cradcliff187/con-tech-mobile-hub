
-- Add Row Level Security policies for maintenance tables

-- Enable RLS on all maintenance tables
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is approved company user (reuse existing pattern)
CREATE OR REPLACE FUNCTION public.is_approved_company_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_company_user = true 
    AND profiles.account_status = 'approved'
  );
$$;

-- Maintenance Tasks Policies
CREATE POLICY "Company users can view maintenance tasks" 
  ON public.maintenance_tasks 
  FOR SELECT 
  USING (public.is_approved_company_user());

CREATE POLICY "Company users can create maintenance tasks" 
  ON public.maintenance_tasks 
  FOR INSERT 
  WITH CHECK (public.is_approved_company_user());

CREATE POLICY "Company users can update maintenance tasks" 
  ON public.maintenance_tasks 
  FOR UPDATE 
  USING (public.is_approved_company_user());

CREATE POLICY "Company users can delete maintenance tasks" 
  ON public.maintenance_tasks 
  FOR DELETE 
  USING (public.is_approved_company_user());

-- Maintenance History Policies
CREATE POLICY "Company users can view maintenance history" 
  ON public.maintenance_history 
  FOR SELECT 
  USING (public.is_approved_company_user());

CREATE POLICY "Company users can create maintenance history" 
  ON public.maintenance_history 
  FOR INSERT 
  WITH CHECK (public.is_approved_company_user());

-- Maintenance Schedules Policies
CREATE POLICY "Company users can view maintenance schedules" 
  ON public.maintenance_schedules 
  FOR SELECT 
  USING (public.is_approved_company_user());

CREATE POLICY "Company users can create maintenance schedules" 
  ON public.maintenance_schedules 
  FOR INSERT 
  WITH CHECK (public.is_approved_company_user());

CREATE POLICY "Company users can update maintenance schedules" 
  ON public.maintenance_schedules 
  FOR UPDATE 
  USING (public.is_approved_company_user());

CREATE POLICY "Company users can delete maintenance schedules" 
  ON public.maintenance_schedules 
  FOR DELETE 
  USING (public.is_approved_company_user());
