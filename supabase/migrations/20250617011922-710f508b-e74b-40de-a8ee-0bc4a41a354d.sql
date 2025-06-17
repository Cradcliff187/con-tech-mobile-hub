
-- Add missing columns to equipment_allocations table for comprehensive allocation
ALTER TABLE public.equipment_allocations 
ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS operator_type text CHECK (operator_type IN ('employee', 'user')),
ADD COLUMN IF NOT EXISTS operator_id uuid,
ADD COLUMN IF NOT EXISTS notes text;

-- Add index for operator lookups
CREATE INDEX IF NOT EXISTS idx_equipment_allocations_operator ON public.equipment_allocations(operator_type, operator_id);

-- Add index for task allocations
CREATE INDEX IF NOT EXISTS idx_equipment_allocations_task ON public.equipment_allocations(task_id);

-- Update RLS policy to ensure company users can manage allocations
DROP POLICY IF EXISTS "Company users can manage equipment allocations" ON public.equipment_allocations;
CREATE POLICY "Company users can manage equipment allocations" 
  ON public.equipment_allocations 
  FOR ALL 
  USING (public.is_approved_company_user());
