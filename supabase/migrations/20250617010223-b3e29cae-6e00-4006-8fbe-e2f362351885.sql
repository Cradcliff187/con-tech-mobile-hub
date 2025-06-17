
-- Create equipment_allocations table for date-based equipment scheduling
CREATE TABLE public.equipment_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  allocated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Add Row Level Security
ALTER TABLE public.equipment_allocations ENABLE ROW LEVEL SECURITY;

-- Create policy for company users to manage allocations
CREATE POLICY "Company users can manage equipment allocations" 
  ON public.equipment_allocations 
  FOR ALL 
  USING (public.is_approved_company_user());

-- Create indexes for better performance
CREATE INDEX idx_equipment_allocations_equipment_id ON public.equipment_allocations(equipment_id);
CREATE INDEX idx_equipment_allocations_project_id ON public.equipment_allocations(project_id);
CREATE INDEX idx_equipment_allocations_dates ON public.equipment_allocations(start_date, end_date);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_equipment_allocations_updated_at
  BEFORE UPDATE ON public.equipment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check equipment availability for a given date range
CREATE OR REPLACE FUNCTION public.check_equipment_availability(
  p_equipment_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_allocation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if there are any overlapping allocations
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.equipment_allocations ea
    WHERE ea.equipment_id = p_equipment_id
      AND (p_exclude_allocation_id IS NULL OR ea.id != p_exclude_allocation_id)
      AND (
        (p_start_date <= ea.end_date AND p_end_date >= ea.start_date)
      )
  );
END;
$$;
