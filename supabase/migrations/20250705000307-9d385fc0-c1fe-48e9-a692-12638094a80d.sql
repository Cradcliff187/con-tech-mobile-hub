-- Create equipment_service_documents junction table
CREATE TABLE public.equipment_service_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'routine',
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.equipment_service_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for equipment_service_documents
CREATE POLICY "Company users can view equipment service documents" 
ON public.equipment_service_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage equipment service documents" 
ON public.equipment_service_documents 
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
CREATE INDEX idx_equipment_service_documents_equipment_id ON public.equipment_service_documents(equipment_id);
CREATE INDEX idx_equipment_service_documents_document_id ON public.equipment_service_documents(document_id);
CREATE INDEX idx_equipment_service_documents_service_date ON public.equipment_service_documents(service_date DESC);
CREATE INDEX idx_equipment_service_documents_service_type ON public.equipment_service_documents(service_type);