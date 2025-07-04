-- Create RFI table
CREATE TABLE public.rfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  response TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RFI documents junction table
CREATE TABLE public.rfi_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfi_id UUID NOT NULL REFERENCES public.rfis(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rfi_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfi_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rfis table
CREATE POLICY "Company users can view RFIs" 
ON public.rfis 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can create RFIs" 
ON public.rfis 
FOR INSERT 
WITH CHECK (
  submitted_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can update RFIs" 
ON public.rfis 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can delete RFIs" 
ON public.rfis 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

-- Create RLS policies for rfi_documents table
CREATE POLICY "Company users can view RFI documents" 
ON public.rfi_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage RFI documents" 
ON public.rfi_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

-- Create indexes for performance
CREATE INDEX idx_rfis_project_id ON public.rfis(project_id);
CREATE INDEX idx_rfis_status ON public.rfis(status);
CREATE INDEX idx_rfis_submitted_by ON public.rfis(submitted_by);
CREATE INDEX idx_rfis_assigned_to ON public.rfis(assigned_to);
CREATE INDEX idx_rfis_due_date ON public.rfis(due_date);
CREATE INDEX idx_rfi_documents_rfi_id ON public.rfi_documents(rfi_id);
CREATE INDEX idx_rfi_documents_document_id ON public.rfi_documents(document_id);

-- Create trigger for updated_at
CREATE TRIGGER update_rfis_updated_at
  BEFORE UPDATE ON public.rfis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();