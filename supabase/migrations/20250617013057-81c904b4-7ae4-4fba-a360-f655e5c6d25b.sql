
-- Create equipment assignment history table
CREATE TABLE public.equipment_assignment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_operator_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for equipment assignment history
ALTER TABLE public.equipment_assignment_history ENABLE ROW LEVEL SECURITY;

-- Allow company users to view all assignment history
CREATE POLICY "Company users can view assignment history" 
  ON public.equipment_assignment_history 
  FOR SELECT 
  USING (public.is_approved_company_user());

-- Allow company users to insert assignment history
CREATE POLICY "Company users can create assignment history" 
  ON public.equipment_assignment_history 
  FOR INSERT 
  WITH CHECK (public.is_approved_company_user());

-- Allow company users to update assignment history (mainly for end_date)
CREATE POLICY "Company users can update assignment history" 
  ON public.equipment_assignment_history 
  FOR UPDATE 
  USING (public.is_approved_company_user());

-- Create indexes for better query performance
CREATE INDEX idx_equipment_assignment_history_equipment_id ON public.equipment_assignment_history(equipment_id);
CREATE INDEX idx_equipment_assignment_history_project_id ON public.equipment_assignment_history(project_id);
CREATE INDEX idx_equipment_assignment_history_dates ON public.equipment_assignment_history(start_date, end_date);

-- Migrate existing equipment assignments to history table
-- For equipment that is currently assigned to projects
INSERT INTO public.equipment_assignment_history (
  equipment_id, 
  project_id, 
  operator_id, 
  assigned_operator_id,
  start_date,
  notes
)
SELECT 
  e.id,
  e.project_id,
  e.operator_id,
  e.assigned_operator_id,
  CURRENT_DATE - INTERVAL '30 days' as start_date, -- Assume 30 days ago as default
  'Migrated from existing assignment' as notes
FROM public.equipment e
WHERE e.project_id IS NOT NULL 
   OR e.operator_id IS NOT NULL 
   OR e.assigned_operator_id IS NOT NULL;
