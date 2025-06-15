
-- First, let's fix the client_id foreign key to properly reference stakeholders table
-- since clients should be stakeholders in the system

-- Check current foreign key constraint on projects.client_id
-- Drop the existing incorrect foreign key if it exists
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;

-- Add the correct foreign key constraint to reference stakeholders table
-- since clients should be stakeholders of type 'vendor' or a new client type
ALTER TABLE public.projects 
ADD CONSTRAINT projects_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.stakeholders(id);

-- Add a new stakeholder type for clients if it doesn't exist
-- First check if we need to add 'client' to the stakeholder_type enum
DO $$ 
BEGIN
    -- Add 'client' to stakeholder_type enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'client' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'stakeholder_type'
        )
    ) THEN
        ALTER TYPE stakeholder_type ADD VALUE 'client';
    END IF;
END $$;

-- Update RLS policies to ensure clients can view their own projects
-- Add policy for clients to view projects they are associated with
CREATE POLICY "Clients can view their projects" 
  ON public.projects 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.stakeholders s
      WHERE s.id = client_id
      AND s.profile_id = auth.uid()
    )
  );

-- Ensure stakeholder assignments can link to projects for client access
CREATE POLICY "Stakeholders can view their assignments" 
  ON public.stakeholder_assignments 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.stakeholders s
      WHERE s.id = stakeholder_id
      AND s.profile_id = auth.uid()
    )
  );

-- Enable RLS on stakeholder_assignments if not already enabled
ALTER TABLE public.stakeholder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;

-- Add policy for stakeholders to view their own records
CREATE POLICY "Users can view their stakeholder profiles" 
  ON public.stakeholders 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      profile_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = auth.uid()
        AND pr.is_company_user = true
        AND pr.account_status = 'approved'
      )
    )
  );

-- Company users can create and manage stakeholders
CREATE POLICY "Company users can manage stakeholders" 
  ON public.stakeholders 
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid()
      AND pr.is_company_user = true
      AND pr.account_status = 'approved'
    )
  );
