-- Create safety_incident_photos junction table
CREATE TABLE public.safety_incident_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  safety_incident_id UUID NOT NULL REFERENCES public.safety_incidents(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  UNIQUE(safety_incident_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.safety_incident_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for safety_incident_photos
CREATE POLICY "Company users can view safety incident photos" 
ON public.safety_incident_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
  )
);

CREATE POLICY "Company users can manage safety incident photos" 
ON public.safety_incident_photos 
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
CREATE INDEX idx_safety_incident_photos_incident_id ON public.safety_incident_photos(safety_incident_id);
CREATE INDEX idx_safety_incident_photos_document_id ON public.safety_incident_photos(document_id);
CREATE INDEX idx_safety_incident_photos_display_order ON public.safety_incident_photos(display_order);