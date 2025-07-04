-- Create change_orders table
CREATE TABLE public.change_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  cost_impact DECIMAL(12,2),
  schedule_impact_days INTEGER,
  priority TEXT NOT NULL DEFAULT 'medium',
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  reason_for_change TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create change_order_documents junction table
CREATE TABLE public.change_order_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_order_id UUID NOT NULL REFERENCES public.change_orders(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'supporting',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(change_order_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_order_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for change_orders table
CREATE POLICY "Company users can view change orders" 
ON public.change_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can create change orders" 
ON public.change_orders 
FOR INSERT 
WITH CHECK (
  requested_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can update change orders" 
ON public.change_orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can delete change orders" 
ON public.change_orders 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

-- Create RLS policies for change_order_documents table
CREATE POLICY "Company users can view change order documents" 
ON public.change_order_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage change order documents" 
ON public.change_order_documents 
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
CREATE INDEX idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX idx_change_orders_status ON public.change_orders(status);
CREATE INDEX idx_change_orders_requested_by ON public.change_orders(requested_by);
CREATE INDEX idx_change_orders_approved_by ON public.change_orders(approved_by);
CREATE INDEX idx_change_order_documents_change_order_id ON public.change_order_documents(change_order_id);
CREATE INDEX idx_change_order_documents_document_id ON public.change_order_documents(document_id);

-- Create trigger for updated_at
CREATE TRIGGER update_change_orders_updated_at
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();