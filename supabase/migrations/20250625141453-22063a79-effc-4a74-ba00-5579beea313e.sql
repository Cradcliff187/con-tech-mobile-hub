
-- Create junction table for task-stakeholder assignments
CREATE TABLE public.task_stakeholder_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  assignment_role TEXT DEFAULT 'primary',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, stakeholder_id)
);

-- Enable RLS
ALTER TABLE public.task_stakeholder_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can view task stakeholder assignments" ON public.task_stakeholder_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_company_user = true
        AND profiles.account_status = 'approved'
    )
  );

CREATE POLICY "Company users can manage task stakeholder assignments" ON public.task_stakeholder_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_company_user = true
        AND profiles.account_status = 'approved'
    )
  );

-- Migrate existing single assignments to junction table
INSERT INTO public.task_stakeholder_assignments (task_id, stakeholder_id, assignment_role, assigned_by, status)
SELECT 
  id as task_id,
  assigned_stakeholder_id as stakeholder_id,
  'primary' as assignment_role,
  created_by as assigned_by,
  'active' as status
FROM public.tasks
WHERE assigned_stakeholder_id IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_task_stakeholder_assignments_task_id ON public.task_stakeholder_assignments(task_id);
CREATE INDEX idx_task_stakeholder_assignments_stakeholder_id ON public.task_stakeholder_assignments(stakeholder_id);
CREATE INDEX idx_task_stakeholder_assignments_status ON public.task_stakeholder_assignments(status);

-- Add trigger for updated_at
CREATE TRIGGER update_task_stakeholder_assignments_updated_at
  BEFORE UPDATE ON public.task_stakeholder_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the new table
ALTER TABLE public.task_stakeholder_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_stakeholder_assignments;
